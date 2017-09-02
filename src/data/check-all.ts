import { gameConfig } from "./game-config";
import { gameData } from "./game-data";
import { clearTimer } from "./check-timer";
import { handleNight } from "./handle-night";
import { handleDay } from "./handle-day";

export function checkAll(forceEnd?: boolean) {
	forceEnd = forceEnd || false;
	if(gameData.phase === "day") {
		const voters = gameConfig.allPlayers.filter(p => !gameData.badoozledPlayers.some(b => b === p));
		const remaining = voters.filter(t => !gameData.votes[t]);
		console.log("Remaining votes : " + remaining.length);
		if(!forceEnd) {
			if(remaining.length > 0) {
				gameConfig.channel.send(`There's still ${remaining.length} people who have to vote.`);
				return;
			}
		}
		clearTimer();
		gameConfig.channel.send(`Everybody has voted ! Here's the result.`);
		/** @type {[any, number][]} */
		const results = [];
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
		if(results.length > 1) {
			if(results[0][1] === results[1][1]) {
				gameConfig.channel.send("This was a tie and nobody got mindbroken today.");
				handleNight();
				return;
			}
			const target = results[0][0];
			gameConfig.channel.send(`<@${target.id}> has been chosen as the victim.`);
			gameConfig.channel.send(`The town gather as <@${target.id}> is brought to the chair.`);
			gameConfig.channel.send(`The chair begins its magic, and <@${target.id}> slowly feels their mind sleeping away.`);
			gameConfig.channel.send(`After a while, they're let free to wander around, not able to think anymore.`);
			gameData.badoozledPlayers.push(target);
			handleNight();
			return;
		}
		const target = results[0][0];
		gameConfig.channel.send(`<@${target.id}> has been chosen as the victim.`);		
		gameConfig.channel.send(`The town gather as <@${target.id}> is brought to the chair.`);
		gameConfig.channel.send(`The chair begins its magic, and <@${target.id}> slowly feels their mind sleeping away.`);
		gameConfig.channel.send(`After a while, they're let free to wander around, not able to think anymore.`);
		gameData.badoozledPlayers.push(target);
		handleNight();
		return;
	}
	if(gameData.phase === "night") {
		const voters = gameData.hypnotists.filter(p => !gameData.badoozledPlayers.some(b => b === p));
		const remaining = voters.filter(t => !gameData.votes[t]);
		console.log("Remaining votes : " + remaining.length);
		if(!forceEnd) {
			if(remaining.length > 0) {
				let currentVotes = [];
				for(let vote in gameData.votes) {
					currentVotes.push(gameData.votes[vote]);
				}
				for(let tist of gameData.hypnotists)
					tist.send(`There's still ${remaining.length} people who have to vote. Current votes : ${currentVotes.join(", ")}.`);
				return;
			}
		}
		clearTimer();
		for(let tist of gameData.hypnotists)
			tist.send(`Everybody has voted ! Here's the result.`);
		/** @type {[any, number][]} */
		const results = [];
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
		if(results.length > 1) {
			if(results[0][1] === results[1][1]) {
				for(let tist of gameData.hypnotists)
					tist.send("The vote is closed. This was a tie and nobody got mindbroken today.");
				handleDay();
				return;
			}
			const target = results[0][0];
			for(let tist of gameData.hypnotists)
				tist.send(`You sneak to <@${target.id}>'s house, where you find your fellow tists. With their help, you break <@${target.id}>'s mind.`);
			gameData.badoozledPlayers.push(target);
			gameData.recentlyBadoozled.push(target);
			handleDay();
			return;
		}
		const target = results[0][0];
		for(let tist of gameData.hypnotists)
			tist.send(`You sneak to <@${target.id}>'s house, where you find your fellow tists. With their help, you break <@${target.id}>'s mind.`);
		gameData.badoozledPlayers.push(target);
		gameData.recentlyBadoozled.push(target);
		handleDay();
		return;
	}
}