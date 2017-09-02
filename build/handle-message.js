"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./commands/constants");
const create_game_1 = require("./commands/create-game");
const cancel_create_1 = require("./commands/cancel-create");
const start_game_1 = require("./commands/start-game");
const get_role_1 = require("./commands/get-role");
const vote_1 = require("./commands/vote");
const join_1 = require("./commands/join");
const day_flavours_1 = require("./flavours/day-flavours");
const VOTE_COMMAND_REGEXPR = /^!s vote (.+)$/ig;
function handleMessage(message) {
    switch (message.content) {
        case "!s help":
            return;
        case constants_1.CREATE_COMMAND:
            create_game_1.createGame(message);
            join_1.join(message);
            return;
        case constants_1.CANCEL_CREATE_COMMAND:
            cancel_create_1.cancelCreate(message);
            return;
        case constants_1.JOIN_COMMAND:
            join_1.join(message);
            return;
        case constants_1.START_COMMAND:
            start_game_1.startGame(message);
            return;
        case constants_1.ROLE_COMMAND:
            get_role_1.getRole(message);
            return;
        case "!s test_message0":
            day_flavours_1.enthrallFlavours[0](message.channel, message.author, message.author);
            return;
        case "!s test_message1":
            day_flavours_1.enthrallFlavours[1](message.channel, message.author, message.author);
            return;
        default:
            break;
    }
    const voteData = VOTE_COMMAND_REGEXPR.exec(message.content);
    if (voteData) {
        let voteTarget = voteData[1];
        if (message.mentions.users && message.mentions.users[0]) {
            voteTarget = message.mentions.users[0].username;
        }
        vote_1.handleVote(message, voteTarget);
    }
}
exports.handleMessage = handleMessage;
