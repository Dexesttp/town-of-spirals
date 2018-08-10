import { Message } from "../client/type";
import { safeLoad } from "js-yaml";
import { readFileSync } from "fs";

export function help(message: Message) {
    const flavours = safeLoad(readFileSync("strings/commands.yaml").toString());
    return flavours.help;
}
