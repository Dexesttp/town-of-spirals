import * as jsonfile from "jsonfile";
import * as fs from "fs";
import logger from "./logging";
import { ClientUserChannelOverride } from "discord.js";

const defaultConfig = jsonfile.readFileSync("config.default.json");
if (!fs.existsSync("config.json")) {
    throw new Error("There's no config.json file ! Create it and add your bot token to it.");
}
const config = jsonfile.readFileSync("config.json");

export const ADMIN_ID_LIST: string[] = config.adminList || [ ];
export const CHANNEL_ID_LIST: string[] = config.channelList || [];
export const TOKEN = (() => {
    if (config.token)
    return config.token;
    throw new Error("There's no 'token' attribute in config.json ! Please add your bot token.");
})();

const override: { lossDelete?: boolean, nightDelete?: boolean } = {};

export function LOSS_DELETE(): boolean {
    if (override.lossDelete !== undefined) return override.lossDelete;
    if (config.lossDelete !== undefined) return config.lossDelete;
    if (defaultConfig.lossDelete !== undefined) return defaultConfig.lossDelete;
    return false;
}

export function NIGHT_TIME_DELETE(): boolean {
    if (override.nightDelete !== undefined) return override.nightDelete;
    if (config.nightDelete !== undefined) return config.nightDelete;
    if (defaultConfig.nightDelete !== undefined) return defaultConfig.nightDelete;
    return false;
}

export function setLossTimeDelete(status: boolean) {
    override.lossDelete = status;
}

export function setNightTimeDelete(status: boolean) {
    override.nightDelete = status;
}

logger.basic(`Config loaded !`);
logger.basic(`Mumble on loss : ${LOSS_DELETE()}`);
logger.basic(`Delete at nighttime : ${NIGHT_TIME_DELETE()}`);
