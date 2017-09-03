import { checkEnd } from "./check-end";
import { gameConfig, SpecialRole } from "./game-config";
import { VOTE_COMMAND, SPY_COMMAND, SAVE_COMMAND, SKIP_COMMAND, BREAK_COMMAND, VOTE_NB_COMMAND } from "../commands/constants";
import { timerA } from "./check-timer";
import { User } from "discord.js";
import { handleDay } from "./handle-day";
import { setDetective } from "../commands/spy";
import { canBreak, canSave, setDeprogrammer } from "../commands/deprogram";
import * as moment from "moment";

let remainingSpecialRoles: {user: User, role: SpecialRole}[] = [];

export async function handleNight() {
	if(!gameConfig.channel)
		return;
	if(checkEnd())
		return;
	gameConfig.phase = "night";
	gameConfig.channel.send(`A new night falls on the town.`);
	gameConfig.recentlyBadoozled = [];
	const aliveVillagers = gameConfig.allPlayers.filter(h => !gameConfig.badoozledPlayers.some(b => b === h));
	var saneTists = gameConfig.hypnotists.filter(h => !gameConfig.badoozledPlayers.some(b => b === h));
	for(let tist of saneTists) {
		tist.send(`
The night has fallen. Vote for a new victim with \`${VOTE_COMMAND}\` (without the {}s please. E.g. : \`!s vote Jk\`), or \`${VOTE_NB_COMMAND}\`
The available targets for tonight are : ${aliveVillagers.map((v, id) => `[${id}] ${v.username}`).join(", ")}.
As a reminder, your colleagues are : ${saneTists.map(v => v.username).join(", ")}.
		`);
	}
	remainingSpecialRoles = [];
	for(let userID in gameConfig.specials) {
		const user = gameConfig.allPlayers.filter(u =>
				!gameConfig.badoozledPlayers.some(b => b === u)
				&& u.id === userID)[0];
		if(!user) continue;
		remainingSpecialRoles.push({user, role: gameConfig.specials[userID]});
	}
	gameConfig.votes = {};
	timerA();
	console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Night time !`);
}

export async function handleSpecialRole() {
	const special = remainingSpecialRoles.pop();
	if(!special) {
		handleDay();
		return;
	}
	const alivePlayers = gameConfig.allPlayers.filter(p => !gameConfig.badoozledPlayers.some(b => p === b)).map(u => u.username);
	if(special.role === "detective") {
		console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Detective time !`);
		setDetective(special.user);
		special.user.send(`Time to snoop up on somebody ! Use \`${SPY_COMMAND}\` to spy on a target (without the curly brackets please).`);
		special.user.send(`You can spy on ${alivePlayers.join(", ")}.`);
		return;
	}
	if(special.role === "deprogrammer") {
		const victim = gameConfig.recentlyBadoozled[0];
		const saveAllowed = canSave(special.user); 
		const breakAllowed = canBreak(special.user); 
		if(!breakAllowed && (!victim || !saveAllowed)) {
			handleSpecialRole();
			return;
		}
		console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Deprogrammer time ! Remaining save : ${saveAllowed}, remaining break: ${breakAllowed}`);
		setDeprogrammer(special.user);
		if(victim && saveAllowed)
			special.user.send(`It appears ${victim.username} had their mind broken ! Use \`${SAVE_COMMAND}\` to save them.`);
		if(breakAllowed)
			special.user.send(`You can use the \`${BREAK_COMMAND}\` and your knowledge of conditioning to break somebody arbitrarily. Possible targets are ${alivePlayers.join(", ")}`)
		special.user.send(`You can also use the ${SKIP_COMMAND} to do nothing.`);
		return;
	}
}