import { Message } from "../client/type";
import getRandom from "../utils/rand-from-array";
import { safeLoad } from "js-yaml";
import {readFileSync} from "fs";

export function help(message: Message) {
    const flavours = safeLoad(readFileSync("strings/base.yaml").toString());
    return flavours.help;
}
