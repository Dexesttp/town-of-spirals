"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_config_1 = require("../data/game-config");
const check_timer_1 = require("../data/check-timer");
const constants_1 = require("./constants");
function cancelCreate(message) {
    if (!game_config_1.gameConfig.channel) {
        (message.channel || message.author).send(`No game running. Type \`${constants_1.CREATE_COMMAND}\` create a new game.`);
        return;
    }
    game_config_1.gameConfig.channel.send(`Game cancelled. Type \`${constants_1.CREATE_COMMAND}\` create a new game.`);
    game_config_1.gameConfig.channel = null;
    game_config_1.gameConfig.gameStarter = null;
    game_config_1.gameConfig.allPlayers = [];
    check_timer_1.clearTimer();
}
exports.cancelCreate = cancelCreate;
