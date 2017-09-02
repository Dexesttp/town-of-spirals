import { gameData } from "./game-data";
import { gameConfig } from "./game-config";
import { checkEnd } from "./check-end";
import { timerA } from "./check-timer";
import { newDayFlavours, noEnthrallFlavours, enthrallFlavours, startVoteFlavours } from "../flavours/dawn-flavours";
import getRandFromArray from "../utils/rand-from-array";

export async function handleDay() {
	gameData.phase = "day";
	const flavour = getRandFromArray(newDayFlavours, 1)[0];
	flavour(gameConfig.channel);
	const sanePlayers = gameConfig.allPlayers.filter(p => !gameData.badoozledPlayers.some(b => b === p));
	if(gameData.recentlyBadoozled.length) {
		gameConfig.channel.send(`The villagers all gather in the center of the village. Something is wrong.`)
		for(let broken of gameData.recentlyBadoozled) {
			const owner = getRandFromArray(sanePlayers, 1)[0];
			const flavour = getRandFromArray(enthrallFlavours, 1)[0];
			flavour(gameConfig.channel, broken, owner);
		}
	}
	else {
		const flavour = getRandFromArray(noEnthrallFlavours, 1)[0];
		flavour(gameConfig.channel);
	}
	gameData.recentlyBadoozled = [];
	gameData.votes = {};
	if(checkEnd())
		return;
	const startVoteFlavour = getRandFromArray(startVoteFlavours, 1)[0];
	startVoteFlavour(gameConfig.channel);
	timerA();
	console.log("Day time");
}