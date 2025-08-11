import { mergeStream } from "sflow"; // TODO: ensure tree shake sflow
import { Readable, Writable } from "stream";
import { fromReadable } from "./fromReadable";
import { fromWritable } from "./fromWritable";
import { fromDuplex } from "./fromDuplex";

/**
 * Creates a TransformStream from a process's stdio, dropping stderr output
 * @template IN - Input data type (string or Uint8Array)
 * @template OUT - Output data type (string or Uint8Array)
 * @param p - A process object with stdin, stdout, and stderr streams
 * @returns A TransformStream that connects stdin to stdout, ignoring stderr
 */
export function fromStdioDropErr<IN extends string | Uint8Array, OUT extends string | Uint8Array>(
  /** a process, which has stdin, stdout, stderr */
  p: {
    stdin?: Writable | WritableStream | null;
    stdout?: Readable | ReadableStream | null;
    stderr?: Readable | ReadableStream | null;
  }
): TransformStream<IN, OUT> {
  return {
    writable: fromWritable<IN>(p.stdin!),
    readable: fromReadable<OUT>(p.stdout!),
  };
}

/**
 * Creates a TransformStream from a process's stdio, merging stdout and stderr
 * @template IN - Input data type (string or Uint8Array)
 * @template OUT - Output data type (string or Uint8Array)
 * @param p - A process object with stdin, stdout, and stderr streams
 * @returns A TransformStream that connects stdin to a merged stdout+stderr stream
 */
export function fromStdioMergeError<IN extends string | Uint8Array, OUT extends string | Uint8Array>(
  /** a process, which has stdin, stdout, stderr */
  p: {
    stdin?: Writable | WritableStream | null;
    stdout?: Readable | ReadableStream | null;
    stderr?: Readable | ReadableStream | null;
  }
): TransformStream<IN, OUT> {
  const stdin = fromWritable<IN>(p.stdin!);
  const stdout = fromReadable<OUT>(p.stdout!);
  const stderr = fromReadable<OUT>(p.stderr!);
  return {
    writable: stdin,
    readable: mergeStream(stdout, stderr),
  };
}

/**
 * Creates a TransformStream from a process's stdio, forwarding stderr to a specified stream
 * @template IN - Input data type (string or Uint8Array)
 * @template OUT - Output data type (string or Uint8Array)
 * @param p - A process object with stdin, stdout, and stderr streams
 * @param options - Configuration object
 * @param options.stderr - The writable stream to forward stderr to
 * @returns A TransformStream that connects stdin to stdout, forwarding stderr separately
 */
export function fromStdioAndForwardError<IN extends string | Uint8Array, OUT extends string | Uint8Array>(
  /** a process, which has stdin, stdout, stderr */
  p: {
    stdin?: Writable | WritableStream | null;
    stdout?: Readable | ReadableStream | null;
    stderr?: Readable | ReadableStream | null;
  },
  { stderr }: {
    stderr: Writable | WritableStream
  }
): TransformStream<IN, OUT> {
  const stdin = fromWritable<IN>(p.stdin!);
  const stdout = fromReadable<OUT>(p.stdout!);
  if (p.stderr)
    fromReadable(p.stderr).pipeTo(fromWritable(stderr));
  return {
    writable: stdin, readable: stdout,
  };
}

/**
 * Creates a TransformStream from a process's stdio with configurable stderr handling
 * @template IN - Input data type (string or Uint8Array)
 * @template OUT - Output data type (string or Uint8Array)
 * @param p - A process object with stdin, stdout, and stderr streams
 * @param options - Configuration object for stderr handling
 * @param options.stderr - Writable stream to forward stderr to, or null to drop stderr, or undefined to merge with stdout
 * @returns A TransformStream that connects stdin to stdout with the specified stderr behavior
 */
export function fromStdio<IN extends string | Uint8Array, OUT extends string | Uint8Array>(
  /** a process, which has stdin, stdout, stderr */
  p: {
    stdin?: Writable | WritableStream | null;
    stdout?: Readable | ReadableStream | null;
    stderr?: Readable | ReadableStream | null;
  },
  {
    stderr,
  }: {
    /** specify stderr to forward, or set to null to drop. */
    stderr?: Writable | WritableStream | null;
  } = {}
): TransformStream<IN, OUT> {
  if (stderr === undefined) {
    return fromStdioMergeError(p);

  } else if (stderr === null) {
    return fromStdioDropErr(p);
  } else {
    // forward stderr if stderr is specified
    if (p.stderr)
      fromReadable(p.stderr).pipeTo(fromWritable(stderr));
    return fromStdioDropErr(p);
  }

}

export { fromReadable, fromWritable, fromDuplex };
