import * as Discord from "discord.js";
import { CREATE_COMMAND, CANCEL_CREATE_COMMAND, JOIN_COMMAND, START_COMMAND, ROLE_COMMAND, LEAVE_COMMAND, SAVE_COMMAND, SKIP_COMMAND } from "./commands/constants";
import { createGame } from "./commands/create-game";
import { cancelCreate } from "./commands/cancel-create";
import { startGame } from "./commands/start-game";
import { getRole } from "./commands/get-role";
import { handleVote } from "./commands/vote";
import { join } from "./commands/join";
import * as moment from "moment";
import { revealFlavours } from "./flavours/reveal-flavours";
import { voteFlavours } from "./flavours/vote-flavour";
import { leave } from "./commands/leave";
import { newDayFlavours } from "./flavours/new-day-flavours";
import { noEnthrallFlavours } from "./flavours/no-enthrall-flavours";
import { enthrallFlavours } from "./flavours/enthrall-flavours";
import { startVoteFlavours } from "./flavours/start-vote-flavours";
import { setSave, setSkip, setBreak } from "./commands/deprogram";
import { handleSpy } from "./commands/spy";

const VOTE_COMMAND_REGEXP = /^!s vote (.+)$/ig;
const SPY_COMMAND_REGEXP = /^!s spy (.+)$/ig;
const BREAK_COMMAND_REGEXP = /^!s break (.+)$/ig;
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
		case LEAVE_COMMAND:
			leave(message);
			return;
		case START_COMMAND:
			startGame(message);
			return;
		case ROLE_COMMAND:
			getRole(message);
			return;
		case SAVE_COMMAND:
			setSave(message);
			return;
		case SKIP_COMMAND:
			setSkip(message);
			return;
		default:
			break;
	}
	const voteData = VOTE_COMMAND_REGEXP.exec(message.content);
	if(voteData) {
		let voteTarget = voteData[1];
		if(message.mentions.members && message.mentions.members) {
			const member = message.mentions.members.first();
			if(member)
				voteTarget = member.user.username;
		}
		handleVote(message, voteTarget);
		return;
	}
	const spyData = SPY_COMMAND_REGEXP.exec(message.content);
	if(spyData) {
		handleSpy(message, spyData[1]);
		return;
	}
	const breakData = BREAK_COMMAND_REGEXP.exec(message.content);
	if(breakData) {
		setBreak(message, breakData[1]);
		return;
	}
	const messageData = MESSAGE_COMMAND_REGEXP.exec(message.content);
	if(messageData) {
		try {

			switch(messageData[1]) {
				case "new-day": {
					const flavour = newDayFlavours[+(messageData[2])];
					message.channel.send(flavour());
				}; return;
				case "no-enthrall": {
					const flavour = noEnthrallFlavours[+(messageData[2])];
					message.channel.send(flavour());
				}; return;
				case "enthrall": {
					const flavour = enthrallFlavours[+(messageData[2])];
					message.channel.send(flavour(message.author.username, message.author.username));
				}; return;
				case "start-vote": {
					const flavour = startVoteFlavours[+(messageData[2])];
					message.channel.send(flavour([]));
				}; return;
				case "reveal-hypnotist": {
					const flavour = revealFlavours.hypnotist[+(messageData[2])];
					message.channel.send(flavour(message.author));
				}; return;
				case "reveal-villager": {
					const flavour = revealFlavours.villager[+(messageData[2])];
					message.channel.send(flavour(message.author));
				}; return;
				case "reveal-detective": {
					const flavour = revealFlavours.detective[+(messageData[2])];
					message.channel.send(flavour(message.author));
				}; return;
				case "reveal-deprogrammer": {
					const flavour = revealFlavours.deprogrammer[+(messageData[2])];
					message.channel.send(flavour(message.author));
				}; return;
				case "vote": {
					const flavour = voteFlavours[+(messageData[2])];
					message.channel.send(flavour(message.author.username, message.author.username));
				}; return;
				default:
				message.channel.send(`Invalid flavour : ${messageData[1]}. Available ones are \`new-day\`, \`no-enthrall\`, \`enthrall\`, \`start-vote\`, \`hypnotist-reveal\`, \`villager-reveal\`, \`vote\`.`);
			}
		}
		catch(e) {
			message.channel.send(`Invalid flavour index : ${messageData[2]}.`);
		}
		return;
	}
}
