import { exec } from "child_process";
import sflow from "sflow";
import { fromStdioDropErr, fromStdioMergeError } from ".";
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
