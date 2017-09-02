import {gameConfig, getNickname} from "../data/game-config";
import {gameData} from "../data/game-data";
import getRandom from "../utils/rand-from-array";
import { handleNight } from "../data/handle-night";
import { CREATE_COMMAND, CANCEL_CREATE_COMMAND } from "./constants";
import { Message } from "discord.js";

const MIN_PLAYERS = 4;
const HYPNOTISTS_PERCENT = 0.25;

export async function startGame(message: Message) {
	if(!gameConfig.channel) {
		message.channel.send(`No game started. Start a game first with \`${CREATE_COMMAND}\`.`);
		return;
	}
	if(message.author !== gameConfig.gameStarter) {
		const authorNickname = await getNickname(gameConfig.gameStarter);
		gameConfig.channel.send(`This game was created by ${authorNickname}. They should start the game, or you should use the \`${CANCEL_CREATE_COMMAND}\` command to cancel the game.`);		
		return;
	}
	if(gameConfig.allPlayers.length < MIN_PLAYERS) {
		gameConfig.channel.send(`There's currently less than ${MIN_PLAYERS} players in the game. Bring some more friends to play !`);
		return;
	}
	gameConfig.channel.send(`Starting the game...`)
	.then((message: Message) => {
		const n = Math.ceil(gameConfig.allPlayers.length * HYPNOTISTS_PERCENT);
		gameData.hypnotists = getRandom(gameConfig.allPlayers, n);
		gameData.badoozledPlayers = [];
		message.delete(500);
		for(let player of gameConfig.allPlayers) {
			if(gameData.hypnotists.some(h => h === player))
				player.send(`The game has started ! you are a hypnotist, along with ${gameData.hypnotists.map(h => h.username).join(", ")}`);
			else
				player.send(`The game has started ! You are a normal citizen.`);				
		}
		gameConfig.channel.send(`
${gameConfig.allPlayers.map(p => `<@${p.id}>`).join(" , ")} , the game has started !
There's ${n} hypnotists in the town of spirals.
		`);
		handleNight();
	});
}