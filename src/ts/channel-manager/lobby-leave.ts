import * as discord from "discord.js";
import { ManagerContext } from "./types";
import { getUserChannel } from "./utils";
import logger from "../logging";

export function leaveGame(context: ManagerContext) {
    return async (message: discord.Message) => {
        const data = getUserChannel(context)(message.author.id);
        if (data === null) return;
        if (data.type === "NOT_STARTED") {
            await message.channel.send("You are not currently in any game. No need to leave.");
            return;
        }
        if (data.type === "RUNNING") {
            await message.channel.send("You cannot leave a running game. Sorry !");
            return;
        }
        const player = data.creator.players().filter(p => p.id === message.author.id)[0];
        await data.creator.removePlayer(message);
        logger.channel(data.channel.name, `${message.author.username} left the lobby.`);
        await data.channel.send(`${player.nickname} has left the game. ${data.creator.players().length} player(s) waiting for start !`);
    };
}
