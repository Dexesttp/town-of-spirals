import { readFileSync } from "fs";
import { load } from "js-yaml";
import { PREFIX } from "../client/command-handler";
import { Message } from "../client/type";

export function help(message: Message) {
  const flavours = load(
    readFileSync("strings/commands.yaml").toString()
  ) as any;
  return flavours.help.replace(/\[COMMAND_PREFIX\]/g, PREFIX);
}
