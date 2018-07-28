import * as discord from "discord.js";
import { ManagerContext } from "./types";

export function unregisterChannel(context: ManagerContext) {
    return (channel: discord.TextChannel) => {
        context.channelList = context.channelList.filter(c => c.channel.id === channel.id);
    };
}
