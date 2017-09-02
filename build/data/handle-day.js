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
const dawn_flavours_1 = require("../flavours/dawn-flavours");
const rand_from_array_1 = require("../utils/rand-from-array");
function handleDay() {
    return __awaiter(this, void 0, void 0, function* () {
        game_data_1.gameData.phase = "day";
        const flavour = rand_from_array_1.default(dawn_flavours_1.newDayFlavours, 1)[0];
        flavour(game_config_1.gameConfig.channel);
        const sanePlayers = game_config_1.gameConfig.allPlayers.filter(p => !game_data_1.gameData.badoozledPlayers.some(b => b === p));
        if (game_data_1.gameData.recentlyBadoozled.length) {
            game_config_1.gameConfig.channel.send(`The villagers all gather in the center of the village. Something is wrong.`);
            for (let broken of game_data_1.gameData.recentlyBadoozled) {
                const owner = rand_from_array_1.default(sanePlayers, 1)[0];
                const flavour = rand_from_array_1.default(dawn_flavours_1.enthrallFlavours, 1)[0];
                flavour(game_config_1.gameConfig.channel, broken, owner);
            }
        }
        else {
            const flavour = rand_from_array_1.default(dawn_flavours_1.noEnthrallFlavours, 1)[0];
            flavour(game_config_1.gameConfig.channel);
        }
        game_data_1.gameData.recentlyBadoozled = [];
        game_data_1.gameData.votes = {};
        if (check_end_1.checkEnd())
            return;
        const startVoteFlavour = rand_from_array_1.default(dawn_flavours_1.startVoteFlavours, 1)[0];
        startVoteFlavour(game_config_1.gameConfig.channel);
        check_timer_1.timerA();
        console.log("Day time");
    });
}
exports.handleDay = handleDay;
