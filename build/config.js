"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonfile = require("jsonfile");
const fs = require("fs");
const defaultConfig = jsonfile.readFileSync("config.default.json");
if (!fs.existsSync("config.json")) {
    throw new Error("There's config.json file ! Create it and add your bot token to it.");
}
const config = jsonfile.readFileSync("config.json");
exports.CAN_DELETE_MESSAGES = config.canDelete || defaultConfig.canDelete || false;
exports.ALLOW_MUMBLE = config.allowMumble || defaultConfig.allowMumble || false;
exports.MUMBLE_SHOULD_EDIT = config.mumbleShouldEdit || defaultConfig.mumbleShouldEdit || false;
exports.TOKEN = (() => {
    if (config.token)
        return config.token;
    throw new Error("There's no token in config.json ! Please add your bot token.");
})();
