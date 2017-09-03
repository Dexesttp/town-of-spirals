import { User } from "discord.js";
import { gameConfig, getNickname } from "./game-config";
import { revealFlavours } from "../flavours/reveal-flavours";
import { voteFlavours } from "../flavours/vote-flavour";
import getRandFromArray from "../utils/rand-from-array";

export async function handleVote(target: User) {
	if(!gameConfig.channel)
		return;
	const alivePlayers = gameConfig.allPlayers.filter(p => !gameConfig.badoozledPlayers.some(b => b === p) && p !== target);
	const owner = getRandFromArray(alivePlayers, 1)[0];
	const flavour = getRandFromArray(voteFlavours, 1)[0];
	const targetNick = await getNickname(target);
	const ownerNick = await getNickname(owner);
	gameConfig.channel.send(flavour(targetNick, ownerNick));
	const wasTist = gameConfig.hypnotists.some(h => h === target);
	const wasDetective = gameConfig.specials[target.id] === "detective";
	const wasDeprogrammer = gameConfig.specials[target.id] === "deprogrammer";
	const pickedRevealFlavour = wasTist
		? getRandFromArray(revealFlavours.hypnotist, 1)[0]
		: wasDetective ? getRandFromArray(revealFlavours.detective, 1)[0]
		: wasDeprogrammer ? getRandFromArray(revealFlavours.deprogrammer, 1)[0]
		: getRandFromArray(revealFlavours.villager, 1)[0];
	gameConfig.channel.send(pickedRevealFlavour(target));
}