import * as moment from "moment";
import * as jsonfile from "jsonfile";
import * as fs from "fs";

const defaultConfig = jsonfile.readFileSync("config.default.json");
if (!fs.existsSync("config.json")) {
    throw new Error("There's config.json file ! Create it and add your bot token to it.");
}
const config = jsonfile.readFileSync("config.json");

export const CAN_DELETE_MESSAGES = config.canDelete || defaultConfig.canDelete || false;
export const ALLOW_MUMBLE = config.allowMumble || defaultConfig.allowMumble || false;
export const MUMBLE_SHOULD_EDIT = config.mumbleShouldEdit || defaultConfig.mumbleShouldEdit || false;

export const TOKEN = (() => {
    if (config.token)
        return config.token;
    throw new Error("There's no token in config.json ! Please add your bot token.");
})();

console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Config loaded !`);
console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Can delete : ${CAN_DELETE_MESSAGES}`);
console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Allow mumble : ${ALLOW_MUMBLE}`);
console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Mumble should edit : ${MUMBLE_SHOULD_EDIT}`);
