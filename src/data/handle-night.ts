import { checkEnd } from "./check-end";
import { gameConfig } from "./game-config";
import { gameData } from "./game-data";
import { VOTE_COMMAND } from "../commands/constants";
import { timerA } from "./check-timer";

export async function handleNight() {
	if(checkEnd())
		return;
	gameData.phase = "night";
	gameConfig.channel.send(`A new night falls on the town.`);
	gameData.recentlyBadoozled = [];	
	const aliveTists = gameData.hypnotists.filter(h => !gameData.badoozledPlayers.some(b => b === h));
	for(let tist of aliveTists) {
		tist.send(`The night has fallen. Vote for a new victim with \`${VOTE_COMMAND}\`.`)
	}
	gameData.votes = {};
	timerA();
	console.log("Night time");
}