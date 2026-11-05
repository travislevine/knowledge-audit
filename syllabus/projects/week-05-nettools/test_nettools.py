"""Tests for nettools. Run with: python -m unittest -v

Everything runs on 127.0.0.1 or on byte strings: no internet needed.
"""
import ipaddress
import random
import socket
import struct
import threading
import time
import unittest

import nettools
from nettools import (ChatClient, ChatServer, FrameReader, build_query, decode_name, encode_name,
                      format_ipv4, frame, in_subnet, longest_prefix_match, parse_ipv4, parse_response,
                      recv_frame, send_frame, subnet_info)


class TestAddresses(unittest.TestCase):
    def test_parse_and_format(self):
        self.assertEqual(parse_ipv4("0.0.0.0"), 0)
        self.assertEqual(parse_ipv4("192.168.1.1"), 3232235777)
        self.assertEqual(parse_ipv4("255.255.255.255"), 2 ** 32 - 1)
        self.assertEqual(format_ipv4(3232235777), "192.168.1.1")
        rng = random.Random(1)
        for _ in range(200):
            n = rng.randrange(2 ** 32)
            self.assertEqual(format_ipv4(n), str(ipaddress.IPv4Address(n)))
            self.assertEqual(parse_ipv4(format_ipv4(n)), n)

    def test_parse_rejects_bad(self):
        for bad in ["", "1.2.3", "1.2.3.4.5", "256.1.1.1", "1.2.3.-4", "a.b.c.d", "1..2.3"]:
            with self.assertRaises(ValueError, msg=bad):
                parse_ipv4(bad)
        for bad in [-1, 2 ** 32]:
            with self.assertRaises(ValueError):
                format_ipv4(bad)

    def test_subnet_info_example(self):
        self.assertEqual(subnet_info("192.168.10.77/26"), {
            "network": "192.168.10.64", "broadcast": "192.168.10.127", "netmask": "255.255.255.192",
            "prefix": 26, "total": 64, "usable": 62, "first_host": "192.168.10.65", "last_host": "192.168.10.126",
        })

    def test_subnet_info_edges(self):
        info = subnet_info("10.0.0.5/32")
        self.assertEqual((info["network"], info["usable"], info["first_host"], info["last_host"]), ("10.0.0.5", 1, "10.0.0.5", "10.0.0.5"))
        info = subnet_info("10.0.0.4/31")
        self.assertEqual((info["usable"], info["first_host"], info["last_host"]), (2, "10.0.0.4", "10.0.0.5"))
        self.assertEqual(subnet_info("8.8.8.8/0")["netmask"], "0.0.0.0")
        for bad in ["10.0.0.0/33", "10.0.0.0/-1", "10.0.0.0", "10.0.0/8"]:
            with self.assertRaises(ValueError, msg=bad):
                subnet_info(bad)

    def test_subnet_info_matches_ipaddress(self):
        rng = random.Random(2)
        for _ in range(200):
            ip = format_ipv4(rng.randrange(2 ** 32))
            prefix = rng.randint(1, 30)
            net = ipaddress.IPv4Network(f"{ip}/{prefix}", strict=False)
            info = subnet_info(f"{ip}/{prefix}")
            self.assertEqual(info["network"], str(net.network_address))
            self.assertEqual(info["broadcast"], str(net.broadcast_address))
            self.assertEqual(info["netmask"], str(net.netmask))
            self.assertEqual(info["total"], net.num_addresses)
            self.assertEqual(info["usable"], net.num_addresses - 2)

    def test_in_subnet(self):
        self.assertTrue(in_subnet("10.0.1.200", "10.0.0.0/23"))
        self.assertFalse(in_subnet("10.0.2.1", "10.0.0.0/23"))
        self.assertTrue(in_subnet("192.168.1.20", "192.168.1.0/24"))
        self.assertFalse(in_subnet("192.168.2.5", "192.168.1.0/24"))
        self.assertTrue(in_subnet("8.8.8.8", "0.0.0.0/0"))

    def test_longest_prefix_match(self):
        routes = [("0.0.0.0/0", "isp"), ("10.0.0.0/8", "core"), ("10.20.0.0/16", "branch"), ("10.20.30.0/24", "local")]
        self.assertEqual(longest_prefix_match("10.20.30.7", routes), "local")
        self.assertEqual(longest_prefix_match("10.20.200.9", routes), "branch")
        self.assertEqual(longest_prefix_match("10.99.1.1", routes), "core")
        self.assertEqual(longest_prefix_match("8.8.8.8", routes), "isp")
        self.assertIsNone(longest_prefix_match("8.8.8.8", routes[1:]))
        self.assertEqual(longest_prefix_match("10.20.30.7", list(reversed(routes))), "local", "order of routes must not matter")


class TestFraming(unittest.TestCase):
    def test_frame(self):
        self.assertEqual(frame(b"hi"), b"\x00\x00\x00\x02hi")
        self.assertEqual(frame(b""), b"\x00\x00\x00\x00")

    def test_reader_whole_and_split(self):
        r = FrameReader()
        self.assertEqual(r.feed(frame(b"hello")), [b"hello"])
        data = frame(b"one") + frame(b"") + frame("ünïcode ✓".encode())
        r = FrameReader()
        out = []
        for i in range(len(data)):              # one byte at a time
            out += r.feed(data[i:i + 1])
        self.assertEqual(out, [b"one", b"", "ünïcode ✓".encode()])

    def test_reader_random_chunks(self):
        rng = random.Random(3)
        payloads = [bytes(rng.randrange(256) for _ in range(rng.randint(0, 300))) for _ in range(50)]
        stream = b"".join(frame(p) for p in payloads)
        r, out, i = FrameReader(), [], 0
        while i < len(stream):
            n = rng.randint(1, 40)
            out += r.feed(stream[i:i + n])
            i += n
        self.assertEqual(out, payloads)

    def test_reader_rejects_huge_frame(self):
        with self.assertRaises(ValueError):
            FrameReader().feed(struct.pack(">I", nettools.MAX_FRAME + 1))

    def test_send_and_recv_over_socket(self):
        a, b = socket.socketpair()
        with a, b:
            send_frame(a, b"first")
            send_frame(a, b"x" * 100_000)
            self.assertEqual(recv_frame(b), b"first")
            self.assertEqual(recv_frame(b), b"x" * 100_000)
            a.shutdown(socket.SHUT_WR)
            self.assertIsNone(recv_frame(b), "clean close between frames returns None")

    def test_recv_frame_slow_sender(self):
        a, b = socket.socketpair()
        data = frame(b"drip-fed")

        def drip():
            for i in range(len(data)):
                a.sendall(data[i:i + 1])
                time.sleep(0.005)

        t = threading.Thread(target=drip, daemon=True)
        t.start()
        b.settimeout(5)
        self.assertEqual(recv_frame(b), b"drip-fed")
        t.join()
        a.close(); b.close()

    def test_recv_frame_cut_off(self):
        a, b = socket.socketpair()
        a.sendall(frame(b"hello")[:6])
        a.close()
        with self.assertRaises(ConnectionError):
            recv_frame(b)
        b.close()


class TestChat(unittest.TestCase):
    def setUp(self):
        self.server = ChatServer()
        self.port = self.server.start()
        self.clients = []

    def tearDown(self):
        for c in self.clients:
            try:
                c.close()
            except OSError:
                pass
        self.server.stop()

    def connect(self, nick):
        c = ChatClient("127.0.0.1", self.port, nick)
        self.clients.append(c)
        return c

    def test_start_returns_real_port(self):
        self.assertIsInstance(self.port, int)
        self.assertGreater(self.port, 0)

    def test_join_and_broadcast(self):
        alice = self.connect("alice")
        bob = self.connect("bob")
        self.assertEqual(alice.receive(), "* bob joined")
        alice.send("hi bob")
        self.assertEqual(bob.receive(), "alice: hi bob")
        bob.send("hello ✓")
        self.assertEqual(alice.receive(), "bob: hello ✓")
        self.assertIsNone(alice.receive(timeout=0.3), "senders don't get their own messages back")

    def test_three_clients(self):
        a, b = self.connect("a"), self.connect("b")
        self.assertEqual(a.receive(), "* b joined")
        c = self.connect("c")
        self.assertEqual(a.receive(), "* c joined")
        self.assertEqual(b.receive(), "* c joined")
        c.send("hey all")
        self.assertEqual(a.receive(), "c: hey all")
        self.assertEqual(b.receive(), "c: hey all")

    def test_leave(self):
        a, b = self.connect("a"), self.connect("b")
        self.assertEqual(a.receive(), "* b joined")
        b.close()
        self.assertEqual(a.receive(), "* b left")

    def test_abrupt_disconnect_mid_frame(self):
        a = self.connect("a")
        raw = socket.create_connection(("127.0.0.1", self.port), timeout=5)
        send_frame(raw, b"ghost")
        self.assertEqual(a.receive(), "* ghost joined")
        raw.sendall(frame(b"never finished")[:7])
        raw.close()
        self.assertEqual(a.receive(), "* ghost left")
        b = self.connect("b")
        self.assertEqual(a.receive(), "* b joined", "server must keep working after a bad client")

    def test_byte_at_a_time_client(self):
        a = self.connect("a")
        raw = socket.create_connection(("127.0.0.1", self.port), timeout=5)
        try:
            data = frame(b"slowpoke") + frame("one byte at a time".encode())
            for i in range(len(data)):
                raw.sendall(data[i:i + 1])
                time.sleep(0.002)
            self.assertEqual(a.receive(), "* slowpoke joined")
            self.assertEqual(a.receive(), "slowpoke: one byte at a time")
        finally:
            raw.close()

    def test_many_messages_keep_order(self):
        a, b = self.connect("a"), self.connect("b")
        self.assertEqual(a.receive(), "* b joined")
        for i in range(200):
            a.send(f"msg {i}")
        self.assertEqual([b.receive() for _ in range(200)], [f"a: msg {i}" for i in range(200)])

    def test_stop_disconnects_clients(self):
        a = self.connect("a")
        time.sleep(0.1)
        self.server.stop()
        with self.assertRaises(OSError):
            ChatClient("127.0.0.1", self.port, "late").send("anyone?")


def make_response(qid, name, answers, rcode=0):
    """Build a DNS response using compression pointers, like real servers do."""
    header = struct.pack(">HHHHHH", qid, 0x8180 | rcode, 1, len(answers), 0, 0)
    question = encode_name(name) + struct.pack(">HH", 1, 1)
    packet = bytearray(header + question)
    for rtype, ttl, rdata in answers:
        packet += b"\xc0\x0c"                         # name: pointer to the question name at offset 12
        if rtype == 5:                                # CNAME: "cdn" + pointer back to the question name
            rdata = b"\x03cdn\xc0\x0c"
        packet += struct.pack(">HHIH", rtype, 1, ttl, len(rdata)) + rdata
    return bytes(packet)


class TestDns(unittest.TestCase):
    def test_encode_name(self):
        self.assertEqual(encode_name("example.com"), b"\x07example\x03com\x00")
        self.assertEqual(encode_name("example.com."), b"\x07example\x03com\x00")
        self.assertEqual(encode_name("a.b.c"), b"\x01a\x01b\x01c\x00")

    def test_encode_name_rejects_bad(self):
        for bad in ["", "a..b", "x" * 64 + ".com", ("abc." * 70) + "com"]:
            with self.assertRaises(ValueError, msg=bad[:20]):
                encode_name(bad)

    def test_build_query_bytes(self):
        q = build_query("example.com", "A", 0x1234)
        self.assertEqual(q, bytes.fromhex("12340100000100000000000007" + "example".encode().hex() + "03" + "com".encode().hex() + "0000010001"))
        self.assertEqual(build_query("example.com", "AAAA", 1)[-4:], b"\x00\x1c\x00\x01")
        self.assertEqual(build_query("example.com", "MX", 1)[:2], b"\x00\x01")

    def test_decode_name_with_pointer(self):
        data = b"\x00" * 12 + b"\x07example\x03com\x00" + b"\x03www\xc0\x0c"
        self.assertEqual(decode_name(data, 12), ("example.com", 25))
        self.assertEqual(decode_name(data, 25), ("www.example.com", 31))

    def test_decode_name_rejects_loops_and_truncation(self):
        with self.assertRaises(ValueError):
            decode_name(b"\x00" * 12 + b"\xc0\x0c", 12)          # points at itself
        with self.assertRaises(ValueError):
            decode_name(b"\x00" * 12 + b"\x07exa", 12)            # runs off the end

    def test_parse_a_response(self):
        resp = make_response(0xBEEF, "example.com", [(1, 268, bytes([93, 184, 215, 14]))])
        out = parse_response(resp)
        self.assertEqual(out["id"], 0xBEEF)
        self.assertEqual(out["rcode"], 0)
        self.assertEqual(out["questions"], [{"name": "example.com", "type": "A"}])
        self.assertEqual(out["answers"], [{"name": "example.com", "type": "A", "ttl": 268, "data": "93.184.215.14"}])

    def test_parse_cname_mx_and_unknown(self):
        mx = struct.pack(">H", 10) + b"\x04mail\xc0\x0c"
        resp = make_response(7, "example.com", [(5, 3600, b""), (15, 300, mx), (99, 60, b"\xde\xad")])
        answers = parse_response(resp)["answers"]
        self.assertEqual(answers[0], {"name": "example.com", "type": "CNAME", "ttl": 3600, "data": "cdn.example.com"})
        self.assertEqual(answers[1]["data"], "10 mail.example.com")
        self.assertEqual(answers[2]["type"], "TYPE99")
        self.assertEqual(answers[2]["data"], "dead")

    def test_parse_nxdomain(self):
        out = parse_response(make_response(1, "nope.example", [], rcode=3))
        self.assertEqual((out["rcode"], out["answers"]), (3, []))

    def test_parse_rejects_truncated(self):
        resp = make_response(1, "example.com", [(1, 60, bytes([1, 2, 3, 4]))])
        for cut in (5, 20, len(resp) - 2):
            with self.assertRaises(ValueError, msg=f"cut at {cut}"):
                parse_response(resp[:cut])


if __name__ == "__main__":
    unittest.main()
