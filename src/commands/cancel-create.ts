import { gameConfig } from "../data/game-config";
import { clearTimer } from "../data/check-timer";
import { CREATE_COMMAND } from "./constants";
import { Message } from "discord.js";

export function cancelCreate(message: Message) {
	if(!gameConfig.channel) {
		(message.channel || message.author).send(`No game running. Type \`${CREATE_COMMAND}\` create a new game.`);
		return;
	}
	gameConfig.channel.send(`Game cancelled. Type \`${CREATE_COMMAND}\` create a new game.`);
	gameConfig.channel = null;
	gameConfig.gameStarter = null;
	gameConfig.allPlayers = [];
	clearTimer()
}