"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_config_1 = require("./game-config");
const game_data_1 = require("./game-data");
function checkEnd() {
    const alivePlayers = game_config_1.gameConfig.allPlayers.filter(p => !game_data_1.gameData.badoozledPlayers.some(b => b === p));
    const aliveTists = game_data_1.gameData.hypnotists.filter(p => !game_data_1.gameData.badoozledPlayers.some(b => b === p));
    if (alivePlayers.length === aliveTists.length) {
        game_config_1.gameConfig.channel.send(game_config_1.gameConfig.allPlayers.map(p => `<@${p.id}>`).join(", "));
        game_config_1.gameConfig.channel.send(`The hypnotists were : ${game_data_1.gameData.hypnotists.map(p => `<@${p.id}>`).join(", ")}`);
        game_config_1.gameConfig.channel.send(`The game has ended, and the town has fallen to the hypnotists.`);
        game_config_1.gameConfig.channel = null;
        game_data_1.gameData.phase = null;
        return true;
    }
    if (aliveTists.length === 0) {
        game_config_1.gameConfig.channel.send(game_config_1.gameConfig.allPlayers.map(p => `<@${p.id}>`).join(", "));
        game_config_1.gameConfig.channel.send(`The hypnotists were : ${game_data_1.gameData.hypnotists.map(p => `<@${p.id}>`).join(", ")}`);
        game_config_1.gameConfig.channel.send(`The game has ended, and the town is safe from the hypnotists.`);
        game_config_1.gameConfig.channel = null;
        game_data_1.gameData.phase = null;
        return true;
    }
    return false;
}
exports.checkEnd = checkEnd;
