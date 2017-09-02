import * as Discord from "discord.js";
import { CREATE_COMMAND, CANCEL_CREATE_COMMAND, JOIN_COMMAND, START_COMMAND, ROLE_COMMAND } from "./commands/constants";
import { createGame } from "./commands/create-game";
import { cancelCreate } from "./commands/cancel-create";
import { startGame } from "./commands/start-game";
import { getRole } from "./commands/get-role";
import { handleVote } from "./commands/vote";
import { join } from "./commands/join";
import { enthrallFlavours } from "./flavours/dawn-flavours";
import * as moment from "moment";

const VOTE_COMMAND_REGEXP = /^!s vote (.+)$/ig;
const MESSAGE_COMMAND_REGEXP = /^!s message (.+) (.+)$/ig;

export function handleMessage(message: Discord.Message) {
	switch(message.content) {
		case "!s help":
			return;
		case CREATE_COMMAND:
			if(createGame(message))
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
		default:
			break;
	}
	const voteData = VOTE_COMMAND_REGEXP.exec(message.content);
	if(voteData) {
		let voteTarget = voteData[1];
		if(message.mentions.members && message.mentions.members) {
			voteTarget = message.mentions.members.first().user.username;
		}
		handleVote(message, voteTarget);
		return;
	}
	const messageData = MESSAGE_COMMAND_REGEXP.exec(message.content);
	if(messageData) {
		var flavour = enthrallFlavours[+(messageData[1])];
		if(!flavour) {
			message.channel.send(`Invalid flavour : ${messageData[1]}. Choose one less than ${enthrallFlavours.length}.`);
			return;
		}
		flavour(<Discord.TextChannel> message.channel, message.author, message.author);
		return;
	}
}
