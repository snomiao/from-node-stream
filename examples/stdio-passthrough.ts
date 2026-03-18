import { exec } from "child_process";
import { fromStdio } from "../ts/index.ts";
import { fromReadable } from "../ts/fromReadable.ts";
import { fromWritable } from "../ts/fromWritable.ts";

if (import.meta.main) {
  // execute everything from stdio in bash and then output to stdout
  await fromReadable(process.stdin)
    .pipeThrough(fromStdio(exec("bash")))
    .pipeTo(fromWritable(process.stdout));
}
