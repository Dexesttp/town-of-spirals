import { gameConfig, getNickname } from "./game-config";
import { clearTimer } from "./check-timer";
import { handleNight, handleSpecialRole } from "./handle-night";
import { handleDay } from "./handle-day";
import { getVoteResults } from "./get-results";
import { voteFlavours } from "../flavours/vote-flavour";
import { User } from "discord.js";
import { revealFlavours } from "../flavours/reveal-flavours";
import { handleVote } from "./handle-vote";
import * as moment from "moment";

export async function checkAll(forceEnd?: boolean) {
	if(!gameConfig.channel)
		return;
	forceEnd = forceEnd || false;
	if(gameConfig.phase === "day") {
		const voters = gameConfig.allPlayers.filter(p => !gameConfig.badoozledPlayers.some(b => b === p));
		const remaining = voters.filter(t => gameConfig.votes[t.id] === undefined);
		console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Remaining votes : ${remaining.length}.`);
		if(!forceEnd) {
			if(remaining.length > 0) {
				const results = getVoteResults();
				gameConfig.channel.send(`
Current votes : ${results.map(r => r.user ? `${r.user.username} (${r.count})` : `\`Skip the vote\` (${r.count})`).join(", ")}
There's still ${remaining.length} people who have to vote.
				`);
				return;
			}
		}
		clearTimer();
		gameConfig.channel.send(`Everybody has voted ! Here's the result.`);
		const results = getVoteResults();
		if(results.length > 1) {
			if(results[0].count === results[1].count) {
				gameConfig.channel.send("This was a tie and nobody got mindbroken today.");
				handleNight();
				return;
			}
			const target = results[0].user;
			if(target === null) {
				gameConfig.channel.send("The majority voted to skip the vote.");	
				handleNight();
				return;			
			}
			await handleVote(target);
			gameConfig.badoozledPlayers.push(target);
			handleNight();
			return;
		}
		const target = results[0].user;
		if(target === null) {
			gameConfig.channel.send("The majority voted to skip the vote.");	
			handleNight();
			return;			
		}
		await handleVote(target);
		gameConfig.badoozledPlayers.push(target);
		handleNight();
		return;
	}
	if(gameConfig.phase === "night") {
		const voters = gameConfig.hypnotists.filter(p => !gameConfig.badoozledPlayers.some(b => b === p));
		const remaining = voters.filter(t => gameConfig.votes[t.id] === undefined);
		console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Remaining votes : ${remaining.length}.`);
		if(!forceEnd) {
			if(remaining.length > 0) {
				const results = getVoteResults();
				for(let tist of voters)
					tist.send(`
Current votes : ${results.map(r => r.user ? `${r.user.username} (${r.count})` : `\`Skip the vote\` (${r.count})`).join(", ")}
There's still ${remaining.length} people who have to vote.
					`);
				return;
			}
		}
		clearTimer();
		for(let tist of voters)
			tist.send(`Everybody has voted ! Here's the result.`);
		const results = getVoteResults();
		if(results.length > 1) {
			if(results[0].count === results[1].count) {
				for(let tist of voters)
					tist.send("The vote is closed. This was a tie and nobody got mindbroken today.");
				handleSpecialRole();
				return;
			}
			const target = results[0].user;
			if(target === null) {
				for(let tist of voters)
					tist.send("The vote is closed. The majority voted to skip the night.");
				handleSpecialRole();
				return;			
			}
			await handleTistEnd(target, voters);
			gameConfig.badoozledPlayers.push(target);
			gameConfig.recentlyBadoozled.push(target);
			handleSpecialRole();
			return;
		}
		const target = results[0].user;
		if(target === null) {
			for(let tist of voters)
				tist.send("The vote is closed. The majority voted to skip the night.");
			handleSpecialRole();
			return;			
		}
		await handleTistEnd(target, voters);
		gameConfig.badoozledPlayers.push(target);
		gameConfig.recentlyBadoozled.push(target);
		handleSpecialRole();
		return;
	}
}

async function handleTistEnd(target:User, voters: User[]) {
	const targetNickname = await getNickname(target);
	if(voters.length > 0) {
		if(target === voters[0]) {
			for(let tist of voters)
				tist.send(`You pick a mirror, and look at yourself in the eyes. Carefully, you start the process of breaking your own mind.`);		
			return;
		}
		for(let tist of voters)
			tist.send(`You sneak to ${targetNickname}'s house. Carefully, without waking them up, you whisper them into trance, where you start the process of breaking their mind.`);		
		return;
	}
	if(voters.some(t => t === target)) {
		if(voters.length == 2) {
			const remainingTist = voters.filter(v => v !== target)[0];
			const tistNick = await getNickname(remainingTist);
			for(let tist of voters)
				tist.send(`${tistNick} meets ${targetNickname} at their house, where they trick them into trance. ${targetNickname}'s mind quickly gets melted.`);
		}
		for(let tist of voters.filter(v => v !== target))
			tist.send(`You and the other hypnotists sneak into ${targetNickname}'s house. With the ${voters.length - 1} of you, you restrain ${targetNickname} and begin the process of breaking their mind.`);
		target.send(`A bit surprised, you get thrown on your bed by an angry-looking team of ${voters.length - 1} hypnotists. Before you can scream, one of them shut your mouth with their hand, and all you can do is listen to their words and feel your mind slipping away.`);
		return;
	}
	for(let tist of voters)
		tist.send(`You sneak to ${targetNickname}'s house, where you find your fellow tists. With their help, you break ${targetNickname}'s mind.`);
	return;
}