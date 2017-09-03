import * as Discord from "discord.js";
import { CREATE_COMMAND, CANCEL_CREATE_COMMAND, JOIN_COMMAND, START_COMMAND, ROLE_COMMAND, LEAVE_COMMAND, SAVE_COMMAND, SKIP_COMMAND, HELP_COMMAND, NO_VOTE_COMMAND, RULES_COMMAND } from "./commands/constants";
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
import { handleHelp, handleRules } from "./commands/help";
import { gameConfig, getNickname } from "./data/game-config";
import getRandFromArray from "./utils/rand-from-array";
import { mumbleFlavours } from "./flavours/mumble-flavour";

const VOTE_NUMBER_COMMAND_REGEXP = /^!s vote-nb (\d+)$/i;
const VOTE_COMMAND_REGEXP = /^!s vote (.+)$/i;
const VOTE_ID_COMMAND_REGEXP = /^!s vote <@!?(\d+)>/i;
const SPY_COMMAND_REGEXP = /^!s spy (.+)$/i;
const BREAK_COMMAND_REGEXP = /^!s break (.+)$/i;
const MESSAGE_COMMAND_REGEXP = /^!s message (.+) (.+)$/i;

let previousMumble: Discord.Message | null = null;

export function handleMessage(message: Discord.Message, allowMumble: boolean) {
	if(allowMumble && gameConfig.channel === message.channel && gameConfig.badoozledPlayers.some(m => !gameConfig.recentlyBadoozled.some(b => b != m) && m === message.author)) {
		message.delete();
		if(previousMumble)
			previousMumble.delete();
		getNickname(message.author)
		.then(n => {
			if(!gameConfig.channel)
				return;
			const flavour = getRandFromArray(mumbleFlavours, 1)[0];
			gameConfig.channel.send(flavour(n))
			.then(m => previousMumble = m as Discord.Message);
		})
		return;
	}
	const content = message.content;

	if(!content.startsWith("!s")) {
		return;
	}
	console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Received command : '${content}'`);
	const alivePeeps = gameConfig.allPlayers.filter(p => !gameConfig.badoozledPlayers.some(b => b === p));
	switch(content) {
		case HELP_COMMAND:
			handleHelp(message);
			return;
		case RULES_COMMAND:
			handleRules(message);
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
		case "!s vote-nb":
			message.channel.send(`Available IDs are : ${alivePeeps.map((u, id) => `[${id}] ${u.username}`).join(", ")}`);;
			return;
		case NO_VOTE_COMMAND:
			handleVote(message, null);
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
	const voteNumberData = VOTE_NUMBER_COMMAND_REGEXP.exec(content);
	if(voteNumberData) {
		const target = alivePeeps[+voteNumberData[1]];
		if(!target) {
			message.channel.send(`Error. Available IDs are : ${alivePeeps.map((u, id) => `[${id}] ${u.username}`).join(", ")}`);
			return;
		}
		handleVote(message, target.username);
		return;
	}

	const voteIDData = VOTE_ID_COMMAND_REGEXP.exec(content);
	if(voteIDData) {
		let voteTarget = voteIDData[1];
		const member = gameConfig.allPlayers.filter(p => p.id === voteTarget)[0];
		if(!member) {
			message.channel.send("Could not find player with that ID.");
			return;
		}
		handleVote(message, member.username);
		return;
	}

	const voteData = VOTE_COMMAND_REGEXP.exec(content);
	if(voteData) {
		handleVote(message, voteData[1]);
		return;
	}

	const spyData = SPY_COMMAND_REGEXP.exec(content);
	if(spyData) {
		handleSpy(message, spyData[1]);
		return;
	}

	const breakData = BREAK_COMMAND_REGEXP.exec(content);
	if(breakData) {
		setBreak(message, breakData[1]);
		return;
	}

	const messageData = MESSAGE_COMMAND_REGEXP.exec(content);
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
	console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Unknown command : '${content}'.`);
}
