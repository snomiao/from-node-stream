import DIE from "phpdie";
import { mergeStream } from "sflow"; // TODO: tree shake sflow
import { type Readable, type Writable } from "stream";
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
    writable: fromWritable(p.stdin || DIE("Missing stdin")),
    readable: fromReadable(p.stdout || DIE("Missing stdout")),
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
  const stdin = fromWritable(p.stdin || DIE("Missing stdin"));
  const stdout = fromReadable(p.stdout || DIE("Missing stdout"));
  const stderr = fromReadable(p.stderr || DIE("Missing stderr"));
  return {
    writable: stdin,
    readable: mergeStream(stdout, stderr),
  };
}
export { fromReadable, fromWritable };
