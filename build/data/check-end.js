"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const game_config_1 = require("./game-config");
const moment = require("moment");
function checkEnd() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!game_config_1.gameConfig.channel)
            return;
        const alivePlayers = game_config_1.gameConfig.allPlayers.filter(p => !game_config_1.gameConfig.badoozledPlayers.some(b => b === p));
        const aliveTists = game_config_1.gameConfig.hypnotists.filter(p => !game_config_1.gameConfig.badoozledPlayers.some(b => b === p));
        if (alivePlayers.length === aliveTists.length) {
            yield game_config_1.gameConfig.channel.send(`And with their last slaves in their harem, ${aliveTists.map(p => `<@${p.id}>`).join(", ")} have enthralled all of the village.`);
            yield game_config_1.gameConfig.channel.send(game_config_1.gameConfig.allPlayers.map(p => `<@${p.id}>`).join(", "));
            yield game_config_1.gameConfig.channel.send(`The game has ended, and the town has fallen to the hypnotists.`);
            yield game_config_1.gameConfig.channel.send(`The hypnotists were : ${game_config_1.gameConfig.hypnotists.map(p => `<@${p.id}>`).join(", ")}`);
            console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Game ended ! tists won.`);
            game_config_1.gameConfig.channel = null;
            game_config_1.gameConfig.phase = null;
            game_config_1.gameConfig.badoozledPlayers = [];
            game_config_1.gameConfig.recentlyBadoozled = [];
            return true;
        }
        if (aliveTists.length === 0) {
            yield game_config_1.gameConfig.channel.send(game_config_1.gameConfig.allPlayers.map(p => `<@${p.id}>`).join(", "));
            yield game_config_1.gameConfig.channel.send(`The game has ended, and the town is safe from the hypnotists.`);
            yield game_config_1.gameConfig.channel.send(`The hypnotists were : ${game_config_1.gameConfig.hypnotists.map(p => `<@${p.id}>`).join(", ")}`);
            game_config_1.gameConfig.channel = null;
            game_config_1.gameConfig.phase = null;
            game_config_1.gameConfig.badoozledPlayers = [];
            game_config_1.gameConfig.recentlyBadoozled = [];
            console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Game ended ! Town won.`);
            return true;
        }
        return false;
    });
}
exports.checkEnd = checkEnd;
