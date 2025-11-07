/**
 * Test utilities to replace sflow functionality
 */

/**
 * Creates a ReadableStream from a string
 */
function fromString(input: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(input);

  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoded);
      controller.close();
    }
  });
}

/**
 * Converts a ReadableStream to text
 */
async function streamToText(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Handle different value types
      if (value instanceof Uint8Array || value instanceof ArrayBuffer) {
        result += decoder.decode(value, { stream: true });
      } else if (typeof value === 'string') {
        result += value;
      } else {
        // Convert to Uint8Array if it's another type
        const encoder = new TextEncoder();
        result += decoder.decode(encoder.encode(String(value)), { stream: true });
      }
    }
    result += decoder.decode(); // flush
  } finally {
    reader.releaseLock();
  }

  return result;
}

/**
 * A chainable stream utility class to replace sflow functionality
 */
class StreamFlow {
  constructor(private stream: ReadableStream) {}

  /**
   * Pipe through a transform stream
   */
  by(transform: TransformStream): StreamFlow {
    return new StreamFlow(this.stream.pipeThrough(transform));
  }

  /**
   * Convert to text
   */
  async text(): Promise<string> {
    return streamToText(this.stream);
  }

  /**
   * Pipe to a writable stream
   */
  async pipeTo(writable: WritableStream): Promise<void> {
    return this.stream.pipeTo(writable);
  }
}

/**
 * Main sflow replacement function
 */
function sflow(input: string | ReadableStream): StreamFlow {
  if (typeof input === 'string') {
    return new StreamFlow(fromString(input));
  }
  return new StreamFlow(input);
}

export default sflow;