import * as discord from "discord.js";
import { ManagerContext } from "./types";

export function registerChannel(context: ManagerContext) {
    return (channel: discord.TextChannel) => {
        if (context.channelList.some(c => c.channel.id === channel.id))
            return false;
        context.channelList.push({
            type: "NOT_STARTED",
            channel,
        });
        return true;
    };
}
