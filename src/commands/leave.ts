import { gameConfig, getNickname } from "../data/game-config";
import { CREATE_COMMAND } from "./constants";
import { Message } from "discord.js";

export async function leave(message: Message) {
	if(gameConfig.channel === null) {
		message.channel.send(`No game started. Start a game first with \`${CREATE_COMMAND}\`.`);
		return;
	}
	const nickname = await getNickname(message.author);
	if(!gameConfig.allPlayers.some(p => p === message.author)) {
		gameConfig.channel.send(`You didn't join, ${nickname}. No point in leaving.`)
		return;
	}
	if(gameConfig.phase) {
		message.channel.send(`The game is in progress, ${nickname}. You can't leave a running game !`);
		return;
	}
	gameConfig.allPlayers = gameConfig.allPlayers.filter(p => p !== message.author);
	gameConfig.channel.send(`${nickname} left the game (${gameConfig.allPlayers.length} player[s])`);
}