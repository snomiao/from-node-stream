import type { Writable } from "stream";

/**
 * Converts a Node.js Writable stream to a Web API WritableStream
 * @template T - The type of data being written (string or Uint8Array)
 * @param i - The Node.js writable stream to convert
 * @returns A Web API WritableStream that wraps the Node.js stream
 */
export function fromWritable<T extends string | Uint8Array>(
  i: Writable | NodeJS.WritableStream | WritableStream
): WritableStream<T> {
  if(i instanceof WritableStream) return i
  const stream = i as Writable;
  return new WritableStream({
    start: (c) => (stream.on("error", (err: Error) => c.error(err)), undefined),
    abort: (reason) => (
      (stream as Partial<Writable> & Partial<NodeJS.WritableStream>).destroy?.(
        reason
      ),
      undefined
    ),
    write: (data: string | Uint8Array, c) => (stream.write(data), undefined),
    close: () => (stream.end(), undefined),
  });
}
