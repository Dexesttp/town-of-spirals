import {gameConfig} from "./game-config";

export function checkEnd() {
	if(!gameConfig.channel)
		return;
	const alivePlayers = gameConfig.allPlayers.filter(p => !gameConfig.badoozledPlayers.some(b => b === p));
	const aliveTists = gameConfig.hypnotists.filter(p => !gameConfig.badoozledPlayers.some(b => b === p));
	if(alivePlayers.length === aliveTists.length) {
		gameConfig.channel.send(gameConfig.allPlayers.map(p => `<@${p.id}>`).join(", "));
		gameConfig.channel.send(`The hypnotists were : ${gameConfig.hypnotists.map(p => `<@${p.id}>`).join(", ")}`);
		gameConfig.channel.send(`The game has ended, and the town has fallen to the hypnotists.`);
		gameConfig.channel = null;
		gameConfig.phase = null;	
		console.log("Game ended ! Tists won");
		return true;
	}
	if(aliveTists.length === 0) {
		gameConfig.channel.send(gameConfig.allPlayers.map(p => `<@${p.id}>`).join(", "));
		gameConfig.channel.send(`The hypnotists were : ${gameConfig.hypnotists.map(p => `<@${p.id}>`).join(", ")}`);
		gameConfig.channel.send(`The game has ended, and the town is safe from the hypnotists.`);
		gameConfig.channel = null;
		gameConfig.phase = null;
		console.log("Game ended ! Town won.");	
		return true;
	}
	return false;
}