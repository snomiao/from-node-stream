import type { Readable } from "stream";

export function fromReadable<T extends string | Uint8Array>(
  i: Readable | NodeJS.ReadableStream
): ReadableStream<T> {
  return new ReadableStream({
    start: (c) => {
      i.on("data", (data) => c.enqueue(data));
      i.on("close", () => c.close());
      i.on("error", (err) => c.error(err));
    },
    cancel: (reason) => (
      (i as Partial<Readable> & Partial<NodeJS.ReadableStream>).destroy?.(
        reason
      ),
      undefined
    ),
  });
}
