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
  return new WritableStream({
    start: (c) => (i.on("error", (err) => c.error(err)), undefined),
    abort: (reason) => (
      (i as Partial<Writable> & Partial<NodeJS.WritableStream>).destroy?.(
        reason
      ),
      undefined
    ),
    write: (data: string | Uint8Array, c) => (i.write(data), undefined),
    close: () => (i.end(), undefined),
  });
}
