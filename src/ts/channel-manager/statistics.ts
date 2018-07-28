import * as discord from "discord.js";
import logger from "../logging";

export function handleStats(channel: discord.TextChannel, results: any[]) {
    logger.channel(channel.name, `Called stats handling routing (NO OP)`);
    // TODO handle stats.
}
