import * as discord from "discord.js";
import {
    RegisteredGameChannelData,
    CreatingGameChannelData,
    NotStartedGameChannelData,
    ManagerContext,
} from "./types";

export function resetGame(data: CreatingGameChannelData) {
    delete data.createdDate;
    delete data.creator;
    if (data.timeout.cancel) data.timeout.cancel();
    delete data.timeout;
    const newData = <NotStartedGameChannelData><RegisteredGameChannelData>data;
    newData.type = "NOT_STARTED";
}

export function getChannelData(context: ManagerContext) {
    return (channel: discord.TextChannel): RegisteredGameChannelData | null => {
        const data = context.channelList.filter(c => c.channel.id === channel.id);
        if (data.length === 0) {
            return null;
        }
        return data[0];
    };
}

export function getUserChannel(context: ManagerContext) {
    return (userId: string): RegisteredGameChannelData | null => {
        const data = context.channelList.filter(c => {
            if (c.type === "CREATING")
                return c.creator.players().some(p => p.id === userId);
            if (c.type === "RUNNING")
                return c.game.context.players.some(p => p.id === userId);
            return false;
        });
        if (data.length === 0) {
            return null;
        }
        return data[0];
    };
}
