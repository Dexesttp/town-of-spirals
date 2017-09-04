"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./commands/constants");
const create_game_1 = require("./commands/create-game");
const cancel_create_1 = require("./commands/cancel-create");
const start_game_1 = require("./commands/start-game");
const get_role_1 = require("./commands/get-role");
const vote_1 = require("./commands/vote");
const join_1 = require("./commands/join");
const moment = require("moment");
const leave_1 = require("./commands/leave");
const deprogram_1 = require("./commands/deprogram");
const spy_1 = require("./commands/spy");
const help_1 = require("./commands/help");
const game_config_1 = require("./data/game-config");
const message_1 = require("./commands/message");
const mumble_1 = require("./commands/mumble");
const VOTE_NUMBER_COMMAND_REGEXP = /^!s vote-nb (\d+)$/i;
const VOTE_COMMAND_REGEXP = /^!s vote (.+)$/i;
const VOTE_ID_COMMAND_REGEXP = /^!s vote <@!?(\d+)>/i;
const SPY_COMMAND_REGEXP = /^!s spy (.+)$/i;
const BREAK_COMMAND_REGEXP = /^!s break (.+)$/i;
const MESSAGE_COMMAND_REGEXP = /^!s message (.+) (.+)$/i;
function handleMessage(message, allowMumble, mumbleShouldEdit) {
    if (allowMumble
        && game_config_1.gameConfig.channel === message.channel
        && game_config_1.gameConfig.badoozledPlayers.some(m => !game_config_1.gameConfig.recentlyBadoozled.some(b => b != m) && m === message.author)) {
        mumble_1.mumbleMessage(message, mumbleShouldEdit);
        return;
    }
    const content = message.content;
    if (!content.startsWith("!s")) {
        return;
    }
    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Received command : '${content}'`);
    const alivePeeps = game_config_1.gameConfig.allPlayers.filter(p => !game_config_1.gameConfig.badoozledPlayers.some(b => b === p));
    switch (content) {
        case "!s mumble":
            mumble_1.mumbleMessage(message, mumbleShouldEdit);
            return;
        case constants_1.HELP_COMMAND:
            help_1.handleHelp(message);
            return;
        case constants_1.RULES_COMMAND:
            help_1.handleRules(message);
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
        case constants_1.LEAVE_COMMAND:
            leave_1.leave(message);
            return;
        case constants_1.START_COMMAND:
            start_game_1.startGame(message);
            return;
        case constants_1.ROLE_COMMAND:
            get_role_1.getRole(message);
            return;
        case "!s vote-nb":
            message.channel.send(`Available IDs are : ${alivePeeps.map((u, id) => `[${id}] ${u.username}`).join(", ")}`);
            ;
            return;
        case constants_1.NO_VOTE_COMMAND:
            vote_1.handleVote(message, null);
            return;
        case constants_1.SAVE_COMMAND:
            deprogram_1.setSave(message);
            return;
        case constants_1.SKIP_COMMAND:
            deprogram_1.setSkip(message);
            return;
        default:
            break;
    }
    const voteNumberData = VOTE_NUMBER_COMMAND_REGEXP.exec(content);
    if (voteNumberData) {
        const target = alivePeeps[+voteNumberData[1]];
        if (!target) {
            message.channel.send(`Error. Available IDs are : ${alivePeeps.map((u, id) => `[${id}] ${u.username}`).join(", ")}`);
            return;
        }
        vote_1.handleVote(message, target.username);
        return;
    }
    const voteIDData = VOTE_ID_COMMAND_REGEXP.exec(content);
    if (voteIDData) {
        let voteTarget = voteIDData[1];
        const member = game_config_1.gameConfig.allPlayers.filter(p => p.id === voteTarget)[0];
        if (!member) {
            message.channel.send("Could not find player with that ID.");
            return;
        }
        vote_1.handleVote(message, member.username);
        return;
    }
    const voteData = VOTE_COMMAND_REGEXP.exec(content);
    if (voteData) {
        vote_1.handleVote(message, voteData[1]);
        return;
    }
    const spyData = SPY_COMMAND_REGEXP.exec(content);
    if (spyData) {
        spy_1.handleSpy(message, spyData[1]);
        return;
    }
    const breakData = BREAK_COMMAND_REGEXP.exec(content);
    if (breakData) {
        deprogram_1.setBreak(message, breakData[1]);
        return;
    }
    const messageData = MESSAGE_COMMAND_REGEXP.exec(content);
    if (messageData) {
        message_1.printMessage(message, messageData[1], +(messageData[2]));
        return;
    }
    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Unknown command : '${content}'.`);
}
exports.handleMessage = handleMessage;
