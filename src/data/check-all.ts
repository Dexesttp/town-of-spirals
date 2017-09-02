import { gameConfig } from "./game-config";
import { gameData } from "./game-data";
import { clearTimer } from "./check-timer";
import { handleNight } from "./handle-night";
import { handleDay } from "./handle-day";
import { getVoteResults } from "./get-results";
import getRandFromArray from "../utils/rand-from-array";
import { voteFlavours } from "../flavours/vote-flavour";
import { User } from "discord.js";

function dayVoteResult(target: User) {
	const alivePlayers = gameConfig.allPlayers.filter(p => !gameData.badoozledPlayers.some(b => b === p));
	const owner = getRandFromArray(alivePlayers, 1)[0];
	const flavour = getRandFromArray(voteFlavours, 1)[0];
	flavour(gameConfig.channel, target, owner);
}

function nightVoteResult(target: User) {
	for(let tist of gameData.hypnotists)
		tist.send(`You sneak to <@${target.id}>'s house, where you find your fellow tists. With their help, you break <@${target.id}>'s mind.`);
}

export function checkAll(forceEnd?: boolean) {
	forceEnd = forceEnd || false;
	if(gameData.phase === "day") {
		const voters = gameConfig.allPlayers.filter(p => !gameData.badoozledPlayers.some(b => b === p));
		const remaining = voters.filter(t => !gameData.votes[t.id]);
		console.log("Remaining votes : " + remaining.length);
		if(!forceEnd) {
			if(remaining.length > 0) {
				const results = getVoteResults();
				gameConfig.channel.send(`
Current votes : ${results.map(r => `${r[0].username} (${r[1]})`).join(", ")}
There's still ${remaining.length} people who have to vote.
				`);
				return;
			}
		}
		clearTimer();
		gameConfig.channel.send(`Everybody has voted ! Here's the result.`);
		const results = getVoteResults();
		if(results.length > 1) {
			if(results[0][1] === results[1][1]) {
				gameConfig.channel.send("This was a tie and nobody got mindbroken today.");
				handleNight();
				return;
			}
			const target = results[0][0];
			dayVoteResult(target);
			gameData.badoozledPlayers.push(target);
			handleNight();
			return;
		}
		const target = results[0][0];
		dayVoteResult(target);
		gameData.badoozledPlayers.push(target);
		handleNight();
		return;
	}
	if(gameData.phase === "night") {
		const voters = gameData.hypnotists.filter(p => !gameData.badoozledPlayers.some(b => b === p));
		const remaining = voters.filter(t => !gameData.votes[t.id]);
		console.log("Remaining votes : " + remaining.length);
		if(!forceEnd) {
			if(remaining.length > 0) {
				const results = getVoteResults();
				for(let tist of gameData.hypnotists)
					tist.send(`
Current votes : ${results.map(r => `${r[0].username} (${r[1]})`).join(", ")}
There's still ${remaining.length} people who have to vote.
					`);
				return;
			}
		}
		clearTimer();
		for(let tist of gameData.hypnotists)
			tist.send(`Everybody has voted ! Here's the result.`);
		const results = getVoteResults();
		if(results.length > 1) {
			if(results[0][1] === results[1][1]) {
				for(let tist of gameData.hypnotists)
					tist.send("The vote is closed. This was a tie and nobody got mindbroken today.");
				handleDay();
				return;
			}
			const target = results[0][0];
			nightVoteResult(target);
			gameData.badoozledPlayers.push(target);
			gameData.recentlyBadoozled.push(target);
			handleDay();
			return;
		}
		const target = results[0][0];
		nightVoteResult(target);
		gameData.badoozledPlayers.push(target);
		gameData.recentlyBadoozled.push(target);
		handleDay();
		return;
	}
}