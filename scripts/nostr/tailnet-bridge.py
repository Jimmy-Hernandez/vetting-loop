#!/usr/bin/env python3
"""Tailnet bridge for the Vetta Nostr relay demo.

The strfry relay is published on 127.0.0.1:7778 only, so a laptop off-site cannot
reach it. This forwards a tailnet-bound port to that loopback port WITHOUT touching
the relay container (no restart, no data risk). Kill it and nothing changes.

Usage:  python3 scripts/nostr/tailnet-bridge.py [listen_port=7779]
"""
import asyncio, socket, sys

LISTEN_IP = os.environ.get("BRIDGE_LISTEN_IP", "127.0.0.1")  # set to this host's tailnet address
LISTEN_PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 7779
TARGET = ("127.0.0.1", 7778)


async def pipe(reader, writer):
    try:
        while True:
            data = await reader.read(65536)
            if not data:
                break
            writer.write(data)
            await writer.drain()
    except Exception:
        pass
    finally:
        try:
            writer.close()
        except Exception:
            pass


async def handle(client_reader, client_writer):
    try:
        up_reader, up_writer = await asyncio.open_connection(*TARGET)
    except Exception:
        client_writer.close()
        return
    await asyncio.gather(
        pipe(client_reader, up_writer),
        pipe(up_reader, client_writer),
    )
    client_writer.close()


async def main():
    server = await asyncio.start_server(handle, LISTEN_IP, LISTEN_PORT)
    print(f"bridge up: ws://{LISTEN_IP}:{LISTEN_PORT} -> {TARGET[0]}:{TARGET[1]}", flush=True)
    async with server:
        await server.serve_forever()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("bridge stopped")
