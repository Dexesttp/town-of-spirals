import * as moment from "moment";
import { getNickname, gameConfig } from "../data/game-config";
import { JOIN_COMMAND, START_COMMAND } from "./constants";
import { Message, TextChannel } from "discord.js";

export async function createGame(message: Message) {
	if(gameConfig.channel !== null) {
		const authorNickname = await getNickname(gameConfig.gameStarter);
		(message.channel.type === "text"
			? message.channel
			: message.author
		).send(`There's already a game created by ${authorNickname}. Type \`${JOIN_COMMAND}\` to join the game ! (${gameConfig.allPlayers.length} player[s])`)
		return false;
	}
	if(message.channel.type !== "text") {
		message.author.send(`You cannot start a game here. Go to a server channel.`);
		return false;
	}
	gameConfig.gameStarter = message.author;
	gameConfig.allPlayers = [];
	console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message.author.username} created a game !`);
	gameConfig.channel = <TextChannel> message.channel;
	gameConfig.channel.send(`Game started. Type \`${JOIN_COMMAND}\` to join the game, and ${START_COMMAND} to create it !`);
	return true;
}
