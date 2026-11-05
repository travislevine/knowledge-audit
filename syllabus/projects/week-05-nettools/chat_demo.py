"""Try the chat server across terminals, once the tests pass.

    python chat_demo.py server            # terminal 1
    python chat_demo.py client alice      # terminal 2
    python chat_demo.py client bob        # terminal 3

Type a line and press Enter to send it. Ctrl+C (or Ctrl+Z then Enter on
Windows) quits.
"""
import sys
import threading
import time

from nettools import ChatClient, ChatServer

PORT = 9009


def run_server():
    server = ChatServer("127.0.0.1", PORT)
    port = server.start()
    print(f"Chat server listening on 127.0.0.1:{port}. Press Ctrl+C to stop.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        server.stop()
        print("\nStopped.")


def run_client(nick):
    client = ChatClient("127.0.0.1", PORT, nick)
    print(f"Connected as {nick}. Type messages and press Enter.")

    def printer():
        while True:
            msg = client.receive(timeout=0.5)
            if msg is not None:
                print(f"\r{msg}\n> ", end="", flush=True)

    threading.Thread(target=printer, daemon=True).start()
    try:
        for line in sys.stdin:
            line = line.rstrip("\n")
            if line:
                client.send(line)
            print("> ", end="", flush=True)
    except KeyboardInterrupt:
        pass
    client.close()


if __name__ == "__main__":
    if len(sys.argv) >= 2 and sys.argv[1] == "server":
        run_server()
    elif len(sys.argv) >= 3 and sys.argv[1] == "client":
        run_client(sys.argv[2])
    else:
        print(__doc__)
