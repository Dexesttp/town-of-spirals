import * as discord from "discord.js";
import { ClientMessage } from "../client/type";
import { BROKEN } from "../game/data/player-states";
import { ManagerContext } from "./types";
import { getUserChannel } from "./utils";

export function shouldMumble(context: ManagerContext) {
    return (message: ClientMessage<discord.Message>) => {
        const userChannel = getUserChannel(context)(message.author);
        if (!userChannel || userChannel.type !== "RUNNING") return false;
        const playerData = userChannel.game.context.players.filter(p => p.id === message.author)[0];
        if (!playerData) return false;
        return playerData.attributes.some(a => a === BROKEN);
    };
}

export function shouldDelete(context: ManagerContext) {
    return (message: ClientMessage<discord.Message>) => {
        const userChannel = getUserChannel(context)(message.author);
        if (!userChannel || userChannel.type !== "RUNNING") return false;
        return !userChannel.game.isDay();
    };
}
