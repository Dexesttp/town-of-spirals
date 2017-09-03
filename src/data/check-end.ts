import {gameConfig} from "./game-config";
import * as moment from "moment";

export function checkEnd() {
	if(!gameConfig.channel)
		return;
	const alivePlayers = gameConfig.allPlayers.filter(p => !gameConfig.badoozledPlayers.some(b => b === p));
	const aliveTists = gameConfig.hypnotists.filter(p => !gameConfig.badoozledPlayers.some(b => b === p));
	if(alivePlayers.length === aliveTists.length) {
		gameConfig.channel.send(gameConfig.allPlayers.map(p => `<@${p.id}>`).join(", "));
		gameConfig.channel.send(`The hypnotists were : ${gameConfig.hypnotists.map(p => `<@${p.id}>`).join(", ")}`);
		gameConfig.channel.send(`The game has ended, and the town has fallen to the hypnotists.`);
		console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Game ended ! tists won.`);
		gameConfig.channel = null;
		gameConfig.phase = null;
		gameConfig.badoozledPlayers = [];
		gameConfig.recentlyBadoozled = [];
		return true;
	}
	if(aliveTists.length === 0) {
		gameConfig.channel.send(gameConfig.allPlayers.map(p => `<@${p.id}>`).join(", "));
		gameConfig.channel.send(`The hypnotists were : ${gameConfig.hypnotists.map(p => `<@${p.id}>`).join(", ")}`);
		gameConfig.channel.send(`The game has ended, and the town is safe from the hypnotists.`);
		gameConfig.channel = null;
		gameConfig.phase = null;
		gameConfig.badoozledPlayers = [];
		gameConfig.recentlyBadoozled = [];
		console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Game ended ! Town won.`);
		return true;
	}
	return false;
}