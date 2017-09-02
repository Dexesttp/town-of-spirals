import { getNickname, gameConfig } from "../data/game-config";
import { JOIN_COMMAND } from "./constants";

export async function createGame(message) {
	if(gameConfig.channel !== null) {
		const authorNickname = await getNickname(gameConfig.gameStarter);
		gameConfig.channel.send(`There's already a game created by ${authorNickname}. Type \`${JOIN_COMMAND}\` to join the game ! (${gameConfig.allPlayers.length} player[s])`)
		return;
	}
	console.log("Creating game !");
	gameConfig.gameStarter = message.author;
	gameConfig.allPlayers = [];
	gameConfig.channel = message.channel;
	gameConfig.channel.send(`Game started. Type \`${JOIN_COMMAND}\` to join the game !`);
}
