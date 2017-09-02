import { gameConfig } from "../data/game-config";
import { CREATE_COMMAND } from "./constants";
import { gameData } from "../data/game-data";
import { Message } from "discord.js";

export async function getRole(message: Message) {
	if(!gameConfig.channel) {
		message.channel.send(`There's no game started yet ! Start a game with the \`${CREATE_COMMAND}\` command.`);
		return;
	}
	if(!gameConfig.allPlayers.some(p => p === message.author)) {
		message.author.send(`Sorry, you aren't playing in the current game.`);
		return;
	}
	const isBadoozled = gameData.badoozledPlayers.some(p => p === message.author);
	const isHypnotist = gameData.hypnotists.some(p => p === message.author);
	message.author.send(`You are a ${isHypnotist ? "hypnotist" : "subject"}. You are ${isBadoozled ? "deep in trance" : "still sane"}.`);
}