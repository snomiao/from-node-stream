import { mergeStream } from "sflow"; // TODO: ensure tree shake sflow
import { Readable, Writable } from "stream";
import { fromReadable } from "./fromReadable";
import { fromWritable } from "./fromWritable";

/**
 * Creates a TransformStream from a process's stdio, dropping stderr output
 * @param p - A process object with stdin, stdout, and stderr streams
 * @returns A TransformStream that connects stdin to stdout, ignoring stderr
 */
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

/**
 * Creates a TransformStream from a process's stdio, merging stdout and stderr
 * @param p - A process object with stdin, stdout, and stderr streams
 * @returns A TransformStream that connects stdin to a merged stdout+stderr stream
 */
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
 * Creates a TransformStream from a process's stdio, forwarding stderr to a specified stream
 * @param p - A process object with stdin, stdout, and stderr streams
 * @param options - Configuration object
 * @param options.stderr - The writable stream to forward stderr to
 * @returns A TransformStream that connects stdin to stdout, forwarding stderr separately
 */
export function fromStdioAndForwardError(
  /** a process, which has stdin, stdout, stderr */
  p: {
    stdin?: Writable | null;
    stdout?: Readable | null;
    stderr?: Readable | null;
  },
  { stderr }: {
    stderr: Writable
  }
): TransformStream<string | Uint8Array, string | Uint8Array> {
  const stdin = fromWritable(p.stdin!);
  const stdout = fromReadable(p.stdout!);
  if (p.stderr?.pipe)
    fromReadable(p.stderr).pipeTo(fromWritable(stderr));
  return {
    writable: stdin, readable: stdout,
  };
}

/**
 * Creates a TransformStream from a process's stdio with configurable stderr handling
 * @param p - A process object with stdin, stdout, and stderr streams
 * @param options - Configuration object for stderr handling
 * @param options.stderr - Writable stream to forward stderr to, or null to drop stderr, or undefined to merge with stdout
 * @returns A TransformStream that connects stdin to stdout with the specified stderr behavior
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
  if (stderr === undefined) {
    return fromStdioMergeError(p);

  } else if (stderr === null) {
    return fromStdioDropErr(p);
  } else {
    // forward stderr if stderr is specified
    if (p.stderr?.pipe)
      fromReadable(p.stderr).pipeTo(fromWritable(stderr));
    return fromStdioDropErr(p);
  }

}

export { fromReadable, fromWritable };
