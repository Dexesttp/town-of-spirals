import * as yaml from "js-yaml";
import {readFileSync} from "fs";

const result = yaml.safeLoad(readFileSync("strings/mumble.yaml").toString());

export const mumbleFlavours: Array<(userName: string, ownerName: string) => void>
= result.mumble.map((text: string) => (target: string, owner: string) =>
    text.replace(/\[target\]/ig, target).replace(/\[owner\]/ig, owner),
);