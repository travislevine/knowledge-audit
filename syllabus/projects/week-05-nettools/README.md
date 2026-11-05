# Week 5 project: network toolkit

Build four small networking tools: a subnet calculator with routing, a
message framer that copes with TCP's byte stream, a multi-client chat
server, and a DNS packet builder and parser.

**Time:** 4–5 hours · **Files:** `nettools.py` (yours to finish), `test_nettools.py` (don't edit), `chat_demo.py`

All tests run on `127.0.0.1` or on byte strings, so you don't need internet
access. On macOS or Linux, type `python3` where these instructions say
`python`. If Windows Firewall asks about Python the first time, it's safe to
allow private networks only (or cancel: localhost still works).

## Run the tests

```bash
python -m unittest -v
python -m unittest -v -k Addresses       # one section at a time
```

Then try the chat across three terminals:

```bash
python chat_demo.py server
python chat_demo.py client alice
python chat_demo.py client bob
```

## Rules

- Don't use the `ipaddress` module in `nettools.py` (the tests use it to
  check your answers). Do the bit arithmetic yourself.
- Use plain `socket` and `threading` for the chat server. No `socketserver`,
  `asyncio` or third-party libraries. `queue.Queue` is fine in the client.
- Use `struct` (or `int.to_bytes` / `int.from_bytes`) for binary fields.

## Tasks

1. **Addresses and subnets**: `parse_ipv4`, `format_ipv4`, `subnet_info`,
   `in_subnet` and `longest_prefix_match`. Represent addresses as 32-bit
   integers internally; masks are then just `(2**32 - 1) << (32 - prefix)`
   trimmed to 32 bits.
2. **Framing**: `frame`, `FrameReader.feed`, `send_frame` and `recv_frame`.
   A frame is a 4-byte big-endian length followed by that many bytes.
3. **Chat**: `ChatServer` accepts clients in a background thread and gives
   each connection its own thread. The protocol is described in
   `nettools.py`. `ChatClient` reads in a background thread and puts messages
   on a queue that `receive()` takes from.
4. **DNS**: `encode_name`, `build_query`, `decode_name` (including
   compression pointers) and `parse_response`.

## Hints

- `socket.create_connection((host, port), timeout=5)` for clients;
  `socket.socket()`, `bind`, `listen` and `accept` for the server. Use
  `server_sock.getsockname()[1]` to find the port the OS picked.
- `recv(n)` can return fewer than n bytes. Write a helper that loops until
  it has exactly n, and treat `b""` as "the other side closed".
- Several server threads may send to the same client at once. Give each
  client connection a lock, and hold it for the whole `send_frame` call so
  two frames never interleave on the wire.
- Protect the server's list of connected clients with a lock too, and
  remove a client when its thread sees the connection close (or any error).
- To stop the server, call `shutdown(socket.SHUT_RDWR)` and then `close()`
  on the listening socket (wrap the shutdown in `try/except OSError`, since
  Windows raises there). On Linux, `close()` alone doesn't wake a thread
  blocked in `accept()`, so the server would keep accepting connections.
  Once woken, `accept()` raises `OSError` and the accept thread can exit.
  Shutting down client sockets the same way unblocks their threads.
- DNS header: `struct.pack(">HHHHHH", id, flags, qdcount, ancount, nscount, arcount)`.
- A DNS name label starting with the two top bits set (`0xC0`) is a
  **pointer**: the remaining 14 bits are an offset from the start of the
  packet where the rest of the name continues. Count how many pointers you
  follow to detect loops.
- Each answer record is: name, then `>HHIH` (type, class, TTL, data length),
  then the data.

## Stretch goals (optional, no tests)

- **Talk to a real resolver:** send `build_query("example.com")` over UDP to
  `1.1.1.1` port 53 with `socket.socket(socket.AF_INET, socket.SOCK_DGRAM)`,
  `sendto` and `recvfrom`, and parse the reply. Compare with `nslookup`.
- Add a `/nick newname` command to the chat that renames a user.
- Write a tiny HTTP/1.1 client using raw sockets: send
  `GET / HTTP/1.1\r\nHost: example.com\r\nConnection: close\r\n\r\n` to port
  80 and print the status line and headers.

## Questions

Answer briefly here before you commit.

1. The test `test_byte_at_a_time_client` sends one byte at a time. Why must
   a correct server handle this, and why do bugs in this area often go
   unnoticed when testing on localhost?

   _Your answer:_

2. Why does the server need a lock per client connection for sending? What
   would a user see if two frames were interleaved?

   _Your answer:_

3. DNS uses name compression. Why does `decode_name` need to detect pointer
   loops, and what could happen to a server that didn't?

   _Your answer:_

When you're done, commit your work and update the project status and notes
on the Week 5 page.
