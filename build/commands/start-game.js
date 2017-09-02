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
const game_data_1 = require("../data/game-data");
const rand_from_array_1 = require("../utils/rand-from-array");
const handle_night_1 = require("../data/handle-night");
const constants_1 = require("./constants");
const MIN_PLAYERS = 4;
const HYPNOTISTS_PERCENT = 0.25;
function startGame(message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!game_config_1.gameConfig.channel) {
            message.channel.send(`No game started. Start a game first with \`${constants_1.CREATE_COMMAND}\`.`);
            return;
        }
        if (message.author !== game_config_1.gameConfig.gameStarter) {
            const authorNickname = yield game_config_1.getNickname(game_config_1.gameConfig.gameStarter);
            game_config_1.gameConfig.channel.send(`This game was created by ${authorNickname}. They should start the game, or you should use the \`${constants_1.CANCEL_CREATE_COMMAND}\` command to cancel the game.`);
            return;
        }
        if (game_config_1.gameConfig.allPlayers.length < MIN_PLAYERS) {
            game_config_1.gameConfig.channel.send(`There's currently less than ${MIN_PLAYERS} players in the game. Bring some more friends to play !`);
            return;
        }
        game_config_1.gameConfig.channel.send(`Starting the game...`)
            .then((message) => {
            const n = Math.ceil(game_config_1.gameConfig.allPlayers.length * HYPNOTISTS_PERCENT);
            game_data_1.gameData.hypnotists = rand_from_array_1.default(game_config_1.gameConfig.allPlayers, n);
            game_data_1.gameData.badoozledPlayers = [];
            message.delete(500);
            for (let tist of game_data_1.gameData.hypnotists) {
                tist.send(`The game has started ! you are a hypnotist, along with ${game_data_1.gameData.hypnotists.map(h => h.username).join(", ")}`);
            }
            game_config_1.gameConfig.channel.send(`${game_config_1.gameConfig.allPlayers.map(p => `<@${p.id}>`).join(" , ")} , the game has started ! There's ${n} hypnotists in the town of spirals.`);
            handle_night_1.handleNight();
        });
    });
}
exports.startGame = startGame;
