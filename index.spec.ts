import { exec } from "child_process";
import { Transform } from "stream";
import sflow from "sflow";
import { fromStdioDropErr, fromStdioMergeError } from ".";
import { fromDuplex } from "./fromDuplex";
import { fromReadable } from "./fromReadable";
import { fromWritable } from "./fromWritable";

it("from node streams, read + write", async () => {
  // sh instance
  const p = exec("sh");

  await sflow("echo hello, world\n").pipeTo(fromWritable(p.stdin!));
  const output = await sflow(fromReadable(p.stdout!)).text();
  expect(output).toBe("hello, world\n");
});

it("fromStdio works", async () => {
  const p = exec("sh");

  const output = await sflow("echo hello, world\n")
    .by(fromStdioDropErr(p))
    .text();
  expect(output).toBe("hello, world\n");
});

it("fromStdio drop error", async () => {
  const p = exec("sh");

  const output = await sflow("echo oops, error>&2 && echo hell, word\n")
    .by(fromStdioDropErr(p))
    .text();
  expect(output).toBe("hell, word\n");
});

it("fromStdio merge error", async () => {
  const p = exec("sh");

  const output = await sflow("echo oops, error>&2 && echo hell, word\n")
    .by(fromStdioMergeError(p))
    .text();
  expect(output).toBe("oops, error\nhell, word\n");
});

it("fromDuplex works with Transform stream", async () => {
  const transform = new Transform({
    transform(chunk, encoding, callback) {
      this.push(chunk.toString().toUpperCase());
      callback();
    }
  });

  const output = await sflow("hello world\n")
    .by(fromDuplex(transform))
    .text();
  expect(output).toBe("HELLO WORLD\n");
});

it("fromDuplex works with existing TransformStream", async () => {
  const upperCaseTransform = new TransformStream({
    transform(chunk, controller) {
      controller.enqueue(chunk.toString().toUpperCase());
    }
  });

  const result = fromDuplex(upperCaseTransform);
  expect(result).toBe(upperCaseTransform);
});
