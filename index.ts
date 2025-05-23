import { mergeStream } from "sflow"; // TODO: tree shake sflow
import { Readable, Writable } from "stream";
import { fromReadable } from "./fromReadable";
import { fromWritable } from "./fromWritable";

export function fromStdioDropErr(
  /** a process, which has stdin, stdout, stderr */
  p: {
    stdin?: Writable | null;
    stdout?: Readable | null;
    stderr?: Readable | null;
  }
): TransformStream<string | Uint8Array, string | Uint8Array> {
  return {
    writable: fromWritable(p.stdin!),
    readable: fromReadable(p.stdout!),
  };
}

/** Make TransformStream from stdio*/
export function fromStdioMergeError(
  /** a process, which has stdin, stdout, stderr */
  p: {
    stdin?: Writable | null;
    stdout?: Readable | null;
    stderr?: Readable | null;
  }
): TransformStream<string | Uint8Array, string | Uint8Array> {
  const stdin = fromWritable(p.stdin!);
  const stdout = fromReadable(p.stdout!);
  const stderr = fromReadable(p.stderr!);
  return {
    writable: stdin,
    readable: mergeStream(stdout, stderr),
  };
}
/**
 * Make TransformStream from stdio
 */
export function fromStdio(
  /** a process, which has stdin, stdout, stderr */
  p: {
    stdin?: Writable | null;
    stdout?: Readable | null;
    stderr?: Readable | null;
  },
  {
    stderr,
  }: {
    /** specify stderr to forward, or set to null to drop. */
    stderr?: Writable | null;
  } = {}
): TransformStream<string | Uint8Array, string | Uint8Array> {
  if (p.stderr?.pipe && stderr?.pipe)
    fromReadable(p.stderr).pipeTo(fromWritable(stderr), {
      preventClose: true,
    });
  if (stderr === undefined) {
    return fromStdioMergeError(p);
  } else {
    return fromStdioDropErr(p);
  }
}
export { fromReadable, fromWritable };
