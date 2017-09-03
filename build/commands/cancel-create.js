"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_config_1 = require("../data/game-config");
const check_timer_1 = require("../data/check-timer");
const constants_1 = require("./constants");
const create_game_1 = require("./create-game");
function cancelCreate(message) {
    if (!game_config_1.gameConfig.channel) {
        (message.channel || message.author).send(`No game running. Type \`${constants_1.CREATE_COMMAND}\` create a new game.`);
        return;
    }
    if (!create_game_1.checkDate() && game_config_1.gameConfig.gameStarter !== message.author) {
        (message.channel || message.author).send(`The game has been created less than 5 minutes ago (or has been running for less than 30minutes), and you can't cancel it yet.`);
        return;
    }
    game_config_1.gameConfig.channel.send(`Game cancelled. Type \`${constants_1.CREATE_COMMAND}\` create a new game.`);
    game_config_1.gameConfig.channel = null;
    game_config_1.gameConfig.gameStarter = null;
    game_config_1.gameConfig.allPlayers = [];
    check_timer_1.clearTimer();
}
exports.cancelCreate = cancelCreate;
