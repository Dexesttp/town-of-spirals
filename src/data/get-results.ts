import { gameData } from "../data/game-data";
import { gameConfig } from "../data/game-config";
import { User } from "discord.js";

export function getVoteResults() {
	const results: [User, number][] = [];
	for(let value in gameData.votes) {
		const target = gameData.votes[value];
		const targetPlayer = gameConfig.allPlayers.filter(p => p.username === target)[0];
		const targetValues = results.filter(v => v[0] === targetPlayer);
		if(targetValues.length > 0)
			targetValues[0][1] += 1;
		else
			results.push([targetPlayer, 1]);
	}
	results.sort(function(a, b) {
		return b[1] - a[1];
	});
	return results;
}