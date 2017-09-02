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
function createGame(message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (game_config_1.gameConfig.channel !== null) {
            const authorNickname = yield game_config_1.getNickname(game_config_1.gameConfig.gameStarter);
            game_config_1.gameConfig.channel.send(`There's already a game created by ${authorNickname}. Type \`${constants_1.JOIN_COMMAND}\` to join the game ! (${game_config_1.gameConfig.allPlayers.length} player[s])`);
            return;
        }
        console.log("Creating game !");
        game_config_1.gameConfig.gameStarter = message.author;
        game_config_1.gameConfig.allPlayers = [];
        game_config_1.gameConfig.channel = message.channel;
        game_config_1.gameConfig.channel.send(`Game started. Type \`${constants_1.JOIN_COMMAND}\` to join the game !`);
    });
}
exports.createGame = createGame;
