import * as Discord from "discord.js";
import { CREATE_COMMAND, CANCEL_CREATE_COMMAND, JOIN_COMMAND, START_COMMAND, ROLE_COMMAND } from "./commands/constants";
import { createGame } from "./commands/create-game";
import { cancelCreate } from "./commands/cancel-create";
import { startGame } from "./commands/start-game";
import { getRole } from "./commands/get-role";
import { handleVote } from "./commands/vote";
import { join } from "./commands/join";
import { enthrallFlavours } from "./flavours/day-flavours";

const VOTE_COMMAND_REGEXPR = /^!s vote (.+)$/ig;

export function handleMessage(message: Discord.Message) {
	switch(message.content) {
		case "!s help":
			return;
		case CREATE_COMMAND:
			createGame(message);
			join(message);
			return;
		case CANCEL_CREATE_COMMAND: 
			cancelCreate(message);
			return;
		case JOIN_COMMAND:
			join(message);
			return;
		case START_COMMAND:
			startGame(message);
			return;
		case ROLE_COMMAND:
			getRole(message);
			return;
		case "!s test_message0":
			enthrallFlavours[0](<Discord.TextChannel> message.channel, message.author, message.author);
			return;
		case "!s test_message1":
			enthrallFlavours[1](<Discord.TextChannel> message.channel, message.author, message.author);
			return;
		default:
			break;
	}
	const voteData = VOTE_COMMAND_REGEXPR.exec(message.content);
	if(voteData) {
		let voteTarget = voteData[1];
		if(message.mentions.users && message.mentions.users[0]) {
			voteTarget = message.mentions.users[0].username;
		}
		handleVote(message, voteTarget);
	}
}
