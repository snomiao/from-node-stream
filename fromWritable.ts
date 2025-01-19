import type { Writable } from "stream";

export function fromWritable<T extends string | Uint8Array>(
  i: Writable | NodeJS.WritableStream
): WritableStream<T> {
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
