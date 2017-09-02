import {gameConfig} from "./game-config";
import {gameData} from "./game-data";

export function checkEnd() {
	const alivePlayers = gameConfig.allPlayers.filter(p => !gameData.badoozledPlayers.some(b => b === p));
	const aliveTists = gameData.hypnotists.filter(p => !gameData.badoozledPlayers.some(b => b === p));
	if(alivePlayers.length === aliveTists.length) {
		gameConfig.channel.send(gameConfig.allPlayers.map(p => `<@${p.id}>`).join(", "));
		gameConfig.channel.send(`The hypnotists were : ${gameData.hypnotists.map(p => `<@${p.id}>`).join(", ")}`);
		gameConfig.channel.send(`The game has ended, and the town has fallen to the hypnotists.`);
		gameConfig.channel = null;
		gameData.phase = null;		
		return true;
	}
	if(aliveTists.length === 0) {
		gameConfig.channel.send(gameConfig.allPlayers.map(p => `<@${p.id}>`).join(", "));
		gameConfig.channel.send(`The hypnotists were : ${gameData.hypnotists.map(p => `<@${p.id}>`).join(", ")}`);
		gameConfig.channel.send(`The game has ended, and the town is safe from the hypnotists.`);
		gameConfig.channel = null;
		gameData.phase = null;
		return true;
	}
	return false;
}