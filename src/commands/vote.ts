import { gameConfig } from "../data/game-config";
import { gameData } from "../data/game-data";
import { checkAll } from "../data/check-all";
import { CREATE_COMMAND } from "./constants";

export async function handleVote(message, voteTarget) {
	if(gameConfig.channel === null) {
		message.channel.send(`There's no game started yet ! Start a game with the \`${CREATE_COMMAND}\` command.`);
		return;		
	}
	if(!gameConfig.allPlayers.some(p => p === message.author)) {
		message.author.send("You're not playing the game. Sorry.");
		return;		
	}
	if(gameData.phase === "night") {
		if(message.guild) {
			gameConfig.channel.send(`Don't vote here at night, but by DM !. I hope you like having your mind broken, though.`);
			return;
		}
		if(gameData.badoozledPlayers.some(p => p === message.author)) {
			message.author.send(`Sorry, but you're not able to think at all, let alone cast a vote.`);
			return;
		}
		if(!gameData.hypnotists.some(p => p === message.author)) {
			message.author.send(`You're not a hypnotist. You should be asleep at night !`);
			return;			
		}
		var targets = gameConfig.allPlayers.filter(p => !gameData.badoozledPlayers.some(b => b === p));
		if(!targets.some(p => p.username === voteTarget)) {
			message.author.send(`You can't vote for ${voteTarget}, they're not playing or already hypnotized. The available targets are : ${targets.map(t => t.username).join(", ")}`)
			return;
		}
		message.author.send(`You voted for ${voteTarget}.`)		
		gameData.votes[message.author] = voteTarget;
		checkAll();
		return;
	}
	if(gameData.phase === "day") {
		if(!message.guild) {
			message.author.send(`By day, all votes are public.`);
			return;
		}
		if(gameData.badoozledPlayers.some(p => p === message.author)) {
			gameConfig.channel.send(`Sorry <@${message.author.id}>, but you're not able to think at all, let alone cast a vote.`);
			return;
		}
		var targets = gameConfig.allPlayers.filter(p => !gameData.badoozledPlayers.some(b => b === p));
		if(!targets.some(p => p.username === voteTarget)) {
			gameConfig.channel.send(`You can't vote for ${voteTarget}, they're not playing or already hypnotized. The available targets are : ${targets.map(t => t.username).join(", ")}`)
			return;
		}
		gameData.votes[message.author] = voteTarget;
		gameConfig.channel.send(`<@${message.author.id}> voted for ${voteTarget} !`);
		checkAll();
		return;		
	}
}