import { gameData } from "./game-data";
import { gameConfig } from "./game-config";
import { checkEnd } from "./check-end";
import { timerA } from "./check-timer";
import { newDayFlavour, enthrallingResults, startVoteFlavour } from "../flavours/day-flavours";

export async function handleDay() {
	gameData.phase = "day";
	newDayFlavour(gameConfig.channel);
	const sanePlayers = gameConfig.allPlayers.filter(p => !gameData.badoozledPlayers.some(b => b === p));
	enthrallingResults(gameConfig.channel, sanePlayers, gameData.recentlyBadoozled);
	gameData.recentlyBadoozled = [];
	gameData.votes = {};
	if(checkEnd())
		return;
	startVoteFlavour(gameConfig.channel);
	timerA();
	console.log("Day time");
}