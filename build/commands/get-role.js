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
const game_config_1 = require("../data/game-config");
const constants_1 = require("./constants");
const game_data_1 = require("../data/game-data");
function getRole(message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!game_config_1.gameConfig.channel) {
            message.channel.send(`There's no game started yet ! Start a game with the \`${constants_1.CREATE_COMMAND}\` command.`);
            return;
        }
        if (!game_config_1.gameConfig.allPlayers.some(p => p === message.author)) {
            message.author.send(`Sorry, you aren't playing in the current game.`);
            return;
        }
        const isBadoozled = game_data_1.gameData.badoozledPlayers.some(p => p === message.author);
        const isHypnotist = game_data_1.gameData.hypnotists.some(p => p === message.author);
        message.author.send(`You are a ${isHypnotist ? "hypnotist" : "subject"}. You are ${isBadoozled ? "deep in trance" : "still sane"}.`);
    });
}
exports.getRole = getRole;
