import { readFileSync } from "fs";
import { load } from "js-yaml";
import { Message } from "../client/type";

export function help(message: Message) {
    const flavours = load(readFileSync("strings/commands.yaml").toString()) as any;
    return flavours.help;
}
