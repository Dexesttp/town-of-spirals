import { readFileSync } from "fs";
import { safeLoad } from "js-yaml";
import { Message } from "../client/type";

export function rules(message: Message) {
    const flavours = safeLoad(readFileSync("strings/commands.yaml").toString());
    return flavours.rules;
}
