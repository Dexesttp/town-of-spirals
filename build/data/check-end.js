"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_config_1 = require("./game-config");
const moment = require("moment");
function checkEnd() {
    if (!game_config_1.gameConfig.channel)
        return;
    const alivePlayers = game_config_1.gameConfig.allPlayers.filter(p => !game_config_1.gameConfig.badoozledPlayers.some(b => b === p));
    const aliveTists = game_config_1.gameConfig.hypnotists.filter(p => !game_config_1.gameConfig.badoozledPlayers.some(b => b === p));
    if (alivePlayers.length === aliveTists.length) {
        game_config_1.gameConfig.channel.send(game_config_1.gameConfig.allPlayers.map(p => `<@${p.id}>`).join(", "));
        game_config_1.gameConfig.channel.send(`The hypnotists were : ${game_config_1.gameConfig.hypnotists.map(p => `<@${p.id}>`).join(", ")}`);
        game_config_1.gameConfig.channel.send(`The game has ended, and the town has fallen to the hypnotists.`);
        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Game ended ! tists won.`);
        game_config_1.gameConfig.channel = null;
        game_config_1.gameConfig.phase = null;
        game_config_1.gameConfig.badoozledPlayers = [];
        game_config_1.gameConfig.recentlyBadoozled = [];
        return true;
    }
    if (aliveTists.length === 0) {
        game_config_1.gameConfig.channel.send(game_config_1.gameConfig.allPlayers.map(p => `<@${p.id}>`).join(", "));
        game_config_1.gameConfig.channel.send(`The hypnotists were : ${game_config_1.gameConfig.hypnotists.map(p => `<@${p.id}>`).join(", ")}`);
        game_config_1.gameConfig.channel.send(`The game has ended, and the town is safe from the hypnotists.`);
        game_config_1.gameConfig.channel = null;
        game_config_1.gameConfig.phase = null;
        game_config_1.gameConfig.badoozledPlayers = [];
        game_config_1.gameConfig.recentlyBadoozled = [];
        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Game ended ! Town won.`);
        return true;
    }
    return false;
}
exports.checkEnd = checkEnd;
