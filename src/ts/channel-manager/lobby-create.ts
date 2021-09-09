import * as discord from "discord.js";
import * as moment from "moment";
import { GameCreator } from "../game-creator/discord";
import logger from "../logging";
import { TimerPromise } from "../utils/timer";
import { LOBBY_TIMEOUT, MIN_PLAYERS } from "./constants";
import { CreatingGameChannelData, ManagerContext, RegisteredGameChannelData } from "./types";
import { getChannelData, resetGame } from "./utils";

export function createGame(context: ManagerContext) {
    return async (message: discord.Message) => {
        const channel = message.channel;
        if (channel.type !== "GUILD_TEXT") {
            await channel.send("You cannot create a game here. Go to a server channel where the bot is enabled.");
            return;
        }
        const data = getChannelData(context)(message.channel as discord.TextChannel);
        if (data === null) {
            await channel.send("The ToS bot is not enabled for this channel. Ask an admin to register it.");
            return;
        }
        if (data.type === "CREATING") {
            await channel.send("There is already a game being created in this channel. Type `!s join` to join it !");
            return;
        }
        if (data.type === "RUNNING") {
            await channel.send("A game is currently in progress. You cannot create a game while another is running.");
            return;
        }
        const newData = <CreatingGameChannelData><RegisteredGameChannelData>data;
        newData.type = "CREATING";
        newData.creator = GameCreator();
        newData.createdDate = moment();
        newData.timeout = TimerPromise(LOBBY_TIMEOUT);
        newData.timeout.then(_ => {
            resetGame(newData);
            logger.channel(data.channel.name, `Game cancelled : timeout.`);
            return channel.send("15 minutes timeout, game cancelled ! Type `!s create` to create a new game.");
        });
        const player = await newData.creator.addPlayer(message);
        if (!player) {
            logger.channel(newData.channel.name, `There was an error (unk 103) : player who created lobby couldn't be added to game`);
            return;
        }
        logger.channel(newData.channel.name, `Lobby created by ${message.author.username}.`);
        channel.send(`A new game has been created by ${player.nickname} ! You need at least ${MIN_PLAYERS} people to start it.`);
        channel.send("Type `!s join` to join the game and `!s start` to start !");
    };
}
