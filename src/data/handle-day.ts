import { gameConfig, getNickname } from "./game-config";
import { checkEnd } from "./check-end";
import { timerA } from "./check-timer";
import getRandFromArray from "../utils/rand-from-array";
import { revealFlavours } from "../flavours/reveal-flavours";
import { newDayFlavours } from "../flavours/new-day-flavours";
import { enthrallFlavours } from "../flavours/enthrall-flavours";
import { noEnthrallFlavours } from "../flavours/no-enthrall-flavours";
import { startVoteFlavours } from "../flavours/start-vote-flavours";

export async function handleDay() {
	if(!gameConfig.channel)
		return;
	gameConfig.phase = "day";
	const flavour = getRandFromArray(newDayFlavours, 1)[0];
	gameConfig.channel.send(flavour());
	const sanePlayers = gameConfig.allPlayers.filter(p => !gameConfig.badoozledPlayers.some(b => b === p));
	if(gameConfig.recentlyBadoozled.length) {
		gameConfig.channel.send(`The villagers all gather in the center of the village. Something is wrong.`)
		for(let broken of gameConfig.recentlyBadoozled) {
			const owner = getRandFromArray(sanePlayers, 1)[0];
			const flavour = getRandFromArray(enthrallFlavours, 1)[0];
			const brokenNick = await getNickname(broken);
			const ownerNick = await getNickname(owner);
			gameConfig.channel.send(flavour(brokenNick, ownerNick));
			const wasTist = gameConfig.hypnotists.some(h => h === broken);
			const wasDetective = gameConfig.specials[broken.id] === "detective";
			const wasDeprogrammer = gameConfig.specials[broken.id] === "deprogrammer";
			const pickedRevealFlavour = wasTist
				? getRandFromArray(revealFlavours.hypnotist, 1)[0]
				: wasDetective ? getRandFromArray(revealFlavours.detective, 1)[0]
				: wasDeprogrammer ? getRandFromArray(revealFlavours.deprogrammer, 1)[0]
				: getRandFromArray(revealFlavours.villager, 1)[0];
			gameConfig.channel.send(pickedRevealFlavour(broken));
		}
	}
	else {
		const flavour = getRandFromArray(noEnthrallFlavours, 1)[0];
		gameConfig.channel.send(flavour());
	}
	gameConfig.recentlyBadoozled = [];
	gameConfig.votes = {};
	if(checkEnd())
		return;
	const startVoteFlavour = getRandFromArray(startVoteFlavours, 1)[0];
	var targets = gameConfig.allPlayers.filter(p => !gameConfig.badoozledPlayers.some(b => b === p)).map(t => t.username);
	gameConfig.channel.send(startVoteFlavour(targets));
	timerA();
	console.log("Day time");
}