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
const client_1 = require("./discord/client");
const command = require("./discord/command-handler");
const config_1 = require("./config");
const game_config_1 = require("./data/game-config");
const mumble_1 = require("./commands/mumble");
const help_1 = require("./commands/help");
const create_game_1 = require("./commands/create-game");
const join_1 = require("./commands/join");
command.onBefore((message) => __awaiter(this, void 0, void 0, function* () {
    if (config_1.ALLOW_MUMBLE
        && game_config_1.gameConfig.channel === message.channel
        && game_config_1.gameConfig.badoozledPlayers.some(m => !game_config_1.gameConfig.recentlyBadoozled.some(b => b != m) && m === message.author)) {
        mumble_1.mumbleMessage(message, config_1.MUMBLE_SHOULD_EDIT);
        return true;
    }
    return false;
}));
command.on("mumble", (message, text) => __awaiter(this, void 0, void 0, function* () {
    mumble_1.mumbleMessage(message, config_1.MUMBLE_SHOULD_EDIT);
    return true;
}));
command.on("help", (message, text) => __awaiter(this, void 0, void 0, function* () { help_1.handleHelp(message); return true; }));
command.on("rules", (message, text) => __awaiter(this, void 0, void 0, function* () { help_1.handleRules(message); return true; }));
command.on("create", (message, text) => __awaiter(this, void 0, void 0, function* () {
    if (create_game_1.createGame(message))
        join_1.join(message);
    return true;
}));
command.on("rules", (message, text) => __awaiter(this, void 0, void 0, function* () { cancelCreate(message); return true; }));
client_1.client.on("message", command.messageHandler);
