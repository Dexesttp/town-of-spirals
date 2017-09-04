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
const moment = require("moment");
const command = require("./discord/command-handler");
const client_1 = require("./discord/client");
const config_1 = require("./config");
const game_config_1 = require("./data/game-config");
const mumble_1 = require("./commands/mumble");
const help_1 = require("./commands/help");
const create_game_1 = require("./commands/create-game");
const join_1 = require("./commands/join");
const cancel_create_1 = require("./commands/cancel-create");
const leave_1 = require("./commands/leave");
const start_game_1 = require("./commands/start-game");
const deprogram_1 = require("./commands/deprogram");
const vote_1 = require("./commands/vote");
const get_role_1 = require("./commands/get-role");
const spy_1 = require("./commands/spy");
const message_1 = require("./commands/message");
/** Mumbling */
command.onBefore((message) => __awaiter(this, void 0, void 0, function* () {
    if (config_1.ALLOW_MUMBLE
        && game_config_1.gameConfig.channel === message.channel
        && game_config_1.gameConfig.badoozledPlayers.some(m => !game_config_1.gameConfig.recentlyBadoozled.some(b => b != m) && m === message.author)) {
        mumble_1.mumbleMessage(message, config_1.MUMBLE_SHOULD_EDIT);
        return true;
    }
    return false;
}));
/**
 * Help commands
 */
command.on("help", (message, text) => __awaiter(this, void 0, void 0, function* () { help_1.handleHelp(message); return true; }));
command.on("rules", (message, text) => __awaiter(this, void 0, void 0, function* () { help_1.handleRules(message); return true; }));
/**
 * Game start commands
 */
command.on("create", (message, text) => __awaiter(this, void 0, void 0, function* () {
    if (create_game_1.createGame(message))
        join_1.join(message);
    return true;
}));
command.on("cancel-create", (message, text) => __awaiter(this, void 0, void 0, function* () { cancel_create_1.cancelCreate(message); return true; }));
command.on("join", (message, text) => __awaiter(this, void 0, void 0, function* () { join_1.join(message); return true; }));
command.on("leave", (message, text) => __awaiter(this, void 0, void 0, function* () { leave_1.leave(message); return true; }));
command.on("start", (message, text) => __awaiter(this, void 0, void 0, function* () { start_game_1.startGame(message); return true; }));
command.on("role", (message, text) => __awaiter(this, void 0, void 0, function* () { get_role_1.getRole(message); return true; }));
/**
 * Vote commands
 */
command.on("vote", (message, text) => __awaiter(this, void 0, void 0, function* () {
    const voteIDData = /<@!?(\d+)>/i.exec(text);
    if (voteIDData) {
        let voteTarget = voteIDData[1];
        const member = game_config_1.gameConfig.allPlayers.filter(p => p.id === voteTarget)[0];
        if (!member) {
            message.channel.send("Could not find player with that ID.");
            return true;
        }
        vote_1.handleVote(message, member.username);
        return true;
    }
    vote_1.handleVote(message, text.trim());
    return true;
}));
command.on("vote-nb", (message, text) => __awaiter(this, void 0, void 0, function* () {
    const alivePeeps = game_config_1.gameConfig.allPlayers.filter(p => !game_config_1.gameConfig.badoozledPlayers.some(b => b === p));
    if (!text) {
        message.channel.send(`Available IDs are : ${alivePeeps.map((u, id) => `[${id}] ${u.username}`).join(", ")}`);
        return true;
    }
    const index = +(text.trim());
    const target = alivePeeps[index];
    if (!target) {
        message.channel.send(`Invalid ID : ${index}. Available players are : ${alivePeeps.map((u, id) => `[${id}] ${u.username}`).join(", ")}`);
        return true;
    }
    vote_1.handleVote(message, target.username);
    return true;
}));
command.on("no-vote", (message, text) => __awaiter(this, void 0, void 0, function* () { vote_1.handleVote(message, null); return true; }));
/**
 * Special chars commands
 */
command.on("save", (message, text) => __awaiter(this, void 0, void 0, function* () { deprogram_1.setSave(message); return true; }));
command.on("skip", (message, text) => __awaiter(this, void 0, void 0, function* () { deprogram_1.setSkip(message); return true; }));
command.on("break", (message, text) => __awaiter(this, void 0, void 0, function* () { deprogram_1.setBreak(message, text.trim()); return true; }));
command.on("spy", (message, text) => __awaiter(this, void 0, void 0, function* () { spy_1.handleSpy(message, text.trim()); return true; }));
/**
 * Debug commands
 */
command.on("clear-chat", (message, text) => __awaiter(this, void 0, void 0, function* () {
    if (!config_1.CAN_DELETE_MESSAGES)
        return false;
    const postedMessages = yield message.channel.fetchMessages({
        limit: 100,
    });
    let botMessages = postedMessages.map(m => m).filter(m => m.author === client_1.client.user);
    const qty = +text;
    if (qty)
        botMessages = botMessages.filter((m, i) => i < qty);
    yield Promise.all(botMessages.map(m => m.delete()));
    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Deleted ${botMessages.length} messages`);
    return true;
}));
command.on("message", (message, text) => __awaiter(this, void 0, void 0, function* () {
    const splitMessage = /([^\s]+)+ (\d+)/.exec(text);
    if (splitMessage)
        message_1.printMessage(message, splitMessage[1], +(splitMessage[2]));
    return true;
}));
command.on("mumble", (message, text) => __awaiter(this, void 0, void 0, function* () {
    mumble_1.mumbleMessage(message, config_1.MUMBLE_SHOULD_EDIT);
    return true;
}));
client_1.client.on("message", command.messageHandler);
