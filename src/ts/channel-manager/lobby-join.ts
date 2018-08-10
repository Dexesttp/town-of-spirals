import * as discord from "discord.js";
import logger from "../logging";
import { ManagerContext } from "./types";
import { getChannelData, getUserChannel, resetGame } from "./utils";
import { TimerPromise } from "../utils/timer";
import { LOBBY_TIMEOUT, MIN_PLAYERS } from "./constants";

export function joinGame(context: ManagerContext) {
    return async (message: discord.Message) => {
        const channel = message.channel;
        if (channel.type !== "text") {
            await channel.send("You cannot join a game here. Go to a server channel where the bot is enabled.");
            return;
        }
        const data = getChannelData(context)(message.channel as discord.TextChannel);
        if (data === null) return;
        const userData = getUserChannel(context)(message.author.id);
        if (userData) {
            const playerList = (userData.type === "CREATING"
                ? userData.creator.players()
                : userData.type === "RUNNING"
                    ? userData.game.context.players
                    : []);
            const playerData = playerList.filter(p => p.id === message.author.id)[0];
            if (data !== userData) {
                await channel.send(`You already joined another game, ${playerData.nickname}.`);
                return;
            }
            await channel.send(`You already joined the game, ${playerData.nickname}.`);
            return;
        }
        if (data.type === "NOT_STARTED") {
            await channel.send("No game is currently running in this channel.");
            return;
        }
        if (data.type === "RUNNING") {
            await channel.send("A game is currently in progress. Wait for the next one to join !");
            return;
        }
        const player = await data.creator.addPlayer(message);
        if (!player) {
            await channel.send(`There was an error and we couldn't add you to the game.`);
            return;
        }
        if (data.timeout.cancel) data.timeout.cancel();
        data.timeout = TimerPromise(LOBBY_TIMEOUT);
        data.timeout.then(_ => {
            resetGame(data);
            logger.channel(data.channel.name, `Game cancelled : timeout.`);
            return channel.send("15 minutes timeout, game cancelled ! Type `!s create` to create a new game.");
        });
        logger.channel(data.channel.name, `${message.author.username} joined the lobby.`);
        const playerCount = data.creator.players().length;
        let outMessage = `${player.nickname} has joined the game, ${playerCount} player(s) waiting for start.`;
        if (playerCount >= MIN_PLAYERS) {
            outMessage += " Type `!s start` to start the game !";
        }
        await channel.send(outMessage);
    };
}
