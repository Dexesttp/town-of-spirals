import {gameConfig} from "./game-config";
import * as moment from "moment";

export async function checkEnd() {
	if(!gameConfig.channel)
		return;
	const alivePlayers = gameConfig.allPlayers.filter(p => !gameConfig.badoozledPlayers.some(b => b === p));
	const aliveTists = gameConfig.hypnotists.filter(p => !gameConfig.badoozledPlayers.some(b => b === p));
	if(alivePlayers.length === aliveTists.length) {
		await gameConfig.channel.send(`And with their last slaves in their harem, ${aliveTists.map(p => `<@${p.id}>`).join(", ")} have enthralled all of the village.`);
		await gameConfig.channel.send(gameConfig.allPlayers.map(p => `<@${p.id}>`).join(", "));
		await gameConfig.channel.send(`The game has ended, and the town has fallen to the hypnotists.`);
		await gameConfig.channel.send(`The hypnotists were : ${gameConfig.hypnotists.map(p => `<@${p.id}>`).join(", ")}`);
		console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Game ended ! tists won.`);
		gameConfig.channel = null;
		gameConfig.phase = null;
		gameConfig.badoozledPlayers = [];
		gameConfig.recentlyBadoozled = [];
		return true;
	}
	if(aliveTists.length === 0) {
		await gameConfig.channel.send(gameConfig.allPlayers.map(p => `<@${p.id}>`).join(", "));
		await gameConfig.channel.send(`The game has ended, and the town is safe from the hypnotists.`);
		await gameConfig.channel.send(`The hypnotists were : ${gameConfig.hypnotists.map(p => `<@${p.id}>`).join(", ")}`);
		gameConfig.channel = null;
		gameConfig.phase = null;
		gameConfig.badoozledPlayers = [];
		gameConfig.recentlyBadoozled = [];
		console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Game ended ! Town won.`);
		return true;
	}
	return false;
}