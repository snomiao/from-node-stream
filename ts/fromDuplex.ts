import type { Duplex } from "stream";
import { fromReadable } from "./fromReadable";
import { fromWritable } from "./fromWritable";

/**
 * Converts a Node.js Duplex stream to a Web API TransformStream
 * @template IN - The type of data being written (string or Uint8Array)
 * @template OUT - The type of data being read (string or Uint8Array)
 * @param duplex - The Node.js duplex stream to convert
 * @returns A Web API TransformStream that wraps the Node.js duplex stream
 */
export function fromDuplex<IN extends string | Uint8Array, OUT extends string | Uint8Array>(
  duplex: Duplex | TransformStream
): TransformStream<IN, OUT> {
  if (duplex instanceof TransformStream) return duplex;
  
  return {
    readable: fromReadable<OUT>(duplex),
    writable: fromWritable<IN>(duplex),
  };
}