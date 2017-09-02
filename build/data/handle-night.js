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
const check_end_1 = require("./check-end");
const game_config_1 = require("./game-config");
const game_data_1 = require("./game-data");
const constants_1 = require("../commands/constants");
const check_timer_1 = require("./check-timer");
function handleNight() {
    return __awaiter(this, void 0, void 0, function* () {
        if (check_end_1.checkEnd())
            return;
        game_data_1.gameData.phase = "night";
        game_config_1.gameConfig.channel.send(`A new night falls on the town.`);
        game_data_1.gameData.recentlyBadoozled = [];
        const aliveVillagers = game_config_1.gameConfig.allPlayers.filter(h => !game_data_1.gameData.badoozledPlayers.some(b => b === h));
        const aliveTists = game_data_1.gameData.hypnotists.filter(h => !game_data_1.gameData.badoozledPlayers.some(b => b === h));
        for (let tist of aliveTists) {
            tist.send(`
The night has fallen. Vote for a new victim with \`${constants_1.VOTE_COMMAND}\`.
The sleeping villagers with some will left are : ${aliveVillagers.map(v => v.username).join(", ")}.
As a reminder, your colleagues are : ${aliveTists.map(v => v.username).join(", ")}.
		`);
        }
        game_data_1.gameData.votes = {};
        check_timer_1.timerA();
        console.log("Night time");
    });
}
exports.handleNight = handleNight;
