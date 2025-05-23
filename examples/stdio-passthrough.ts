import { exec } from "child_process";
import { fromStdio } from "..";
import { fromReadable } from "../fromReadable";
import { fromWritable } from "../fromWritable";

if (import.meta.main) {
  // execute everything from stdio in bash and then output to stdout
  await fromReadable(process.stdin)
    .pipeThrough(fromStdio(exec("bash")))
    .pipeTo(fromWritable(process.stdout));
}
