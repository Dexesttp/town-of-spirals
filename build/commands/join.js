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
function join(message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (game_config_1.gameConfig.channel === null) {
            message.channel.send(`No game started. Start a game first with \`${constants_1.CREATE_COMMAND}\`.`);
            return;
        }
        if (game_config_1.gameConfig.phase) {
            message.channel.send(`The game is in progress, <@${message.author.id}>. Wait for the next one :D`);
            return;
        }
        const nickname = yield game_config_1.getNickname(message.author);
        if (game_config_1.gameConfig.allPlayers.some(p => p === message.author)) {
            game_config_1.gameConfig.channel.send(`You already joined, ${nickname}. ${game_config_1.gameConfig.allPlayers.length} player[s].`);
            return;
        }
        game_config_1.gameConfig.allPlayers.push(message.author);
        game_config_1.gameConfig.channel.send(`${nickname} joined the game (${game_config_1.gameConfig.allPlayers.length} player[s])`);
    });
}
exports.join = join;
