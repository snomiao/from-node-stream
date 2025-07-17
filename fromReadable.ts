import type { Readable } from "stream";

/**
 * Converts a Node.js Readable stream to a Web API ReadableStream
 * @template T - The type of data being read (string or Uint8Array)
 * @param i - The Node.js readable stream to convert
 * @returns A Web API ReadableStream that wraps the Node.js stream
 */
export function fromReadable<T extends string | Uint8Array>(
  i: Readable | NodeJS.ReadableStream | ReadableStream
): ReadableStream<T> {
  if (i instanceof ReadableStream) return i
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
