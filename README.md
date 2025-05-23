# from-node-stream

## Usage Examples

### Stdio Passthrough Example

Create a script that pipes process stdin through a bash process and then to stdout:

```ts
import { exec } from "child_process";
import { fromStdio } from "from-node-stream";
import { fromReadable } from "from-node-stream/fromReadable";
import { fromWritable } from "from-node-stream/fromWritable";

// Execute everything from stdin in bash and then output to stdout
await fromReadable(process.stdin)
  .pipeThrough(fromStdio(exec("bash")))
  .pipeTo(fromWritable(process.stdout));
```

### Basic: Read and Write from Node Streams

```ts
import { exec } from "child_process";
import { fromWritable, fromReadable } from "from-node-stream";

const p = exec("sh");
// Write to stdin
const writer = fromWritable(p.stdin!).getWriter();
await writer.write("echo hello, world\n");
await writer.close();
// Read from stdout
const reader = fromReadable(p.stdout!).getReader();
let output = "";
while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  output += typeof value === "string" ? value : new TextDecoder().decode(value);
}
console.log(output); // "hello, world\n"
```

### Using `fromStdioDropErr`

```ts
import { exec } from "child_process";
import { fromStdioDropErr } from "from-node-stream";

const p = exec("sh");
// Write to stdin
const writer = fromStdioDropErr(p).writable.getWriter();
await writer.write("echo hello, world\n");
await writer.close();
// Read from stdout
const reader = fromStdioDropErr(p).readable.getReader();
let output = "";
while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  output += typeof value === "string" ? value : new TextDecoder().decode(value);
}
console.log(output); // "hello, world\n"
```

### Using `fromStdioMergeError`

```ts
import { exec } from "child_process";
import { fromStdioMergeError } from "from-node-stream";

const p = exec("sh");
// Write to stdin
const writer = fromStdioMergeError(p).writable.getWriter();
await writer.write("echo oops, error>&2 && echo hell, word\n");
await writer.close();
// Read merged stdout and stderr
const reader = fromStdioMergeError(p).readable.getReader();
let output = "";
while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  output += typeof value === "string" ? value : new TextDecoder().decode(value);
}
console.log(output); // "oops, error\nhell, word\n"
```

### Drop stderr with `fromStdioDropErr`

```ts
import { exec } from "child_process";
import { fromStdioDropErr } from "from-node-stream";

const p = exec("sh");
// Write to stdin
const writer = fromStdioDropErr(p).writable.getWriter();
await writer.write("echo oops, error>&2 && echo hell, word\n");
await writer.close();
// Read from stdout only (stderr dropped)
const reader = fromStdioDropErr(p).readable.getReader();
let output = "";
while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  output += typeof value === "string" ? value : new TextDecoder().decode(value);
}
```

## Development
To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.21. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
