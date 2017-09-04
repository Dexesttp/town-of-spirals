import * as moment from "moment";
import * as command from "./discord/command-handler";
import {client} from "./discord/client"
import { ALLOW_MUMBLE, MUMBLE_SHOULD_EDIT, CAN_DELETE_MESSAGES } from "./config";
import { gameConfig } from "./data/game-config";
import { mumbleMessage } from "./commands/mumble";
import { handleHelp, handleRules } from "./commands/help";
import { createGame } from "./commands/create-game";
import { join } from "./commands/join";
import { cancelCreate } from "./commands/cancel-create";
import { leave } from "./commands/leave";
import { startGame } from "./commands/start-game";
import { setSave, setSkip, setBreak } from "./commands/deprogram";
import { handleVote } from "./commands/vote";
import { getRole } from "./commands/get-role";
import { handleSpy } from "./commands/spy";
import { printMessage } from "./commands/message";
import { TextChannel } from "discord.js";

/** Mumbling */
command.onBefore(async message => {
	if(ALLOW_MUMBLE
		&& gameConfig.channel === message.channel
		&& gameConfig.badoozledPlayers.some(m => !gameConfig.recentlyBadoozled.some(b => b != m) && m === message.author)
	) {
		mumbleMessage(message, MUMBLE_SHOULD_EDIT);
		return true;
	}
	return false;
});

/**
 * Help commands
 */
command.on("help", async (message, text) => { handleHelp(message); return true; });
command.on("rules", async (message, text) => { handleRules(message); return true; });

/**
 * Game start commands
 */
command.on("create", async (message, text) => { 
	if(createGame(message))
		join(message);
	return true;
});
command.on("cancel-create", async (message, text) => { cancelCreate(message); return true; });
command.on("join", async (message, text) => { join(message); return true; });
command.on("leave", async (message, text) => { leave(message); return true; });
command.on("start", async (message, text) => { startGame(message); return true; });

command.on("role", async (message, text) => { getRole(message); return true; });

/**
 * Vote commands
 */
command.on("vote", async (message, text) => {
	const voteIDData = /<@!?(\d+)>/i.exec(text);
	if(voteIDData) {
		let voteTarget = voteIDData[1];
		const member = gameConfig.allPlayers.filter(p => p.id === voteTarget)[0];
		if(!member) {
			message.channel.send("Could not find player with that ID.");
			return true;
		}
		handleVote(message, member.username);
		return true;
	}
	handleVote(message, text.trim());
	return true;
});
command.on("vote-nb", async (message, text) => {
	const alivePeeps = gameConfig.allPlayers.filter(p => !gameConfig.badoozledPlayers.some(b => b === p));
	if(!text) {
		message.channel.send(`Available IDs are : ${alivePeeps.map((u, id) => `[${id}] ${u.username}`).join(", ")}`);
		return true;
	}
	const index = +(text.trim());
	const target = alivePeeps[index];
	if(!target) {
		message.channel.send(`Invalid ID : ${index}. Available players are : ${alivePeeps.map((u, id) => `[${id}] ${u.username}`).join(", ")}`);
		return true;
	}
	handleVote(message, target.username);
	return true;
});
command.on("no-vote", async (message, text) => { handleVote(message, null); return true; });

/**
 * Special chars commands
 */
command.on("save", async (message, text) => { setSave(message); return true; });
command.on("skip", async (message, text) => { setSkip(message); return true; });
command.on("break", async (message, text) => { setBreak(message, text.trim()); return true; });

command.on("spy", async (message, text) => { handleSpy(message, text.trim()); return true; });

/**
 * Debug commands
 */
command.on("clear-chat", async (message, text) => {
	if(!CAN_DELETE_MESSAGES) return false;
	const postedMessages = await message.channel.fetchMessages({
		limit: 100,
	});
	let botMessages = postedMessages.map(m => m).filter(m => m.author === client.user)
	const qty = +text;
	if(qty) botMessages = botMessages.filter((m, i) => i < qty);
	await Promise.all(botMessages.map(m => m.delete()));
	console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Deleted ${botMessages.length} messages`);
	return true;
});
command.on("message", async (message, text) => {
	const splitMessage = /([^\s]+)+ (\d+)/.exec(text);
	if(splitMessage)
		printMessage(message, splitMessage[1], +(splitMessage[2]));
	return true;
});
command.on("mumble", async (message, text) => {
	mumbleMessage(message, MUMBLE_SHOULD_EDIT);
	return true;
});

client.on("message", command.messageHandler);
