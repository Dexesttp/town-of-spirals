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
const game_data_1 = require("./game-data");
const game_config_1 = require("./game-config");
const check_end_1 = require("./check-end");
const check_timer_1 = require("./check-timer");
const day_flavours_1 = require("../flavours/day-flavours");
function handleDay() {
    return __awaiter(this, void 0, void 0, function* () {
        game_data_1.gameData.phase = "day";
        day_flavours_1.newDayFlavour(game_config_1.gameConfig.channel);
        const sanePlayers = game_config_1.gameConfig.allPlayers.filter(p => !game_data_1.gameData.badoozledPlayers.some(b => b === p));
        day_flavours_1.enthrallingResults(game_config_1.gameConfig.channel, sanePlayers, game_data_1.gameData.recentlyBadoozled);
        game_data_1.gameData.recentlyBadoozled = [];
        game_data_1.gameData.votes = {};
        if (check_end_1.checkEnd())
            return;
        day_flavours_1.startVoteFlavour(game_config_1.gameConfig.channel);
        check_timer_1.timerA();
        console.log("Day time");
    });
}
exports.handleDay = handleDay;
