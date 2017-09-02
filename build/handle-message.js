"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./commands/constants");
const create_game_1 = require("./commands/create-game");
const cancel_create_1 = require("./commands/cancel-create");
const start_game_1 = require("./commands/start-game");
const get_role_1 = require("./commands/get-role");
const vote_1 = require("./commands/vote");
const join_1 = require("./commands/join");
const dawn_flavours_1 = require("./flavours/dawn-flavours");
const VOTE_COMMAND_REGEXP = /^!s vote (.+)$/ig;
const MESSAGE_COMMAND_REGEXP = /^!s message (.+) (.+)$/ig;
function handleMessage(message) {
    switch (message.content) {
        case "!s help":
            return;
        case constants_1.CREATE_COMMAND:
            if (create_game_1.createGame(message))
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
        default:
            break;
    }
    const voteData = VOTE_COMMAND_REGEXP.exec(message.content);
    if (voteData) {
        let voteTarget = voteData[1];
        if (message.mentions.members && message.mentions.members) {
            voteTarget = message.mentions.members.first().user.username;
        }
        vote_1.handleVote(message, voteTarget);
        return;
    }
    const messageData = MESSAGE_COMMAND_REGEXP.exec(message.content);
    if (messageData) {
        var flavour = dawn_flavours_1.enthrallFlavours[+(messageData[1])];
        if (!flavour) {
            message.channel.send(`Invalid flavour : ${messageData[1]}. Choose one less than ${dawn_flavours_1.enthrallFlavours.length}.`);
            return;
        }
        flavour(message.channel, message.author, message.author);
        return;
    }
}
exports.handleMessage = handleMessage;
