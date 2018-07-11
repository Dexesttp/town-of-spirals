import * as yaml from "js-yaml";
import {readFileSync} from "fs";

const result = yaml.safeLoad(readFileSync("strings/commands.yaml").toString());
