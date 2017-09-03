import {gameConfig, getNickname} from "../data/game-config";
import getRandom from "../utils/rand-from-array";
import { handleNight } from "../data/handle-night";
import { CREATE_COMMAND, CANCEL_CREATE_COMMAND } from "./constants";
import { Message } from "discord.js";
import { handleDay } from "../data/handle-day";
import * as moment from "moment";

const MIN_PLAYERS = 3;
const HYPNOTISTS_PERCENT = 0.34;

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
		if(!gameConfig.channel) return;
		message.delete(500);
		gameConfig.badoozledPlayers = [];
		gameConfig.recentlyBadoozled = [];
		const n = Math.floor(gameConfig.allPlayers.length * HYPNOTISTS_PERCENT);
		gameConfig.hypnotists = getRandom(gameConfig.allPlayers, n);
		const normalPlayers = gameConfig.allPlayers.filter(p => !gameConfig.hypnotists.some(h => p === h));
		if(gameConfig.hypnotists.length >= 2) {
			const detective = getRandom(normalPlayers, 1)[0];
			gameConfig.specials[detective.id] = "detective";
		}
		if(gameConfig.allPlayers.length >= 4) {
			const deprogrammer = getRandom(normalPlayers.filter(p => !gameConfig.specials[p.id]), 1)[0];
			gameConfig.specials[deprogrammer.id] = "deprogrammer";
		}
		for(let player of gameConfig.allPlayers) {
			if(gameConfig.hypnotists.some(h => h === player))
				player.send(`The game has started ! you are a hypnotist, along with ${gameConfig.hypnotists.map(h => h.username).join(", ")}`);
			else if(gameConfig.specials[player.id] === "detective")
				player.send(`The game has started ! You are a detective.`);
			else if(gameConfig.specials[player.id] === "deprogrammer")
				player.send(`The game has started ! You are a deprogrammer.`);
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