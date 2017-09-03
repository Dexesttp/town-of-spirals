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
const Discord = require("discord.js");
const moment = require("moment");
const jsonfile = require("jsonfile");
const handle_message_1 = require("./handle-message");
const client = new Discord.Client();
const config = jsonfile.readFileSync("config.json");
const CAN_DELETE_MESSAGES = config.canDelete || false;
const ALLOW_MUMBLE = config.allowMumble || false;
client.on("ready", () => {
    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Client ready !`);
    client.user.setUsername("Town of Spirals")
        .then(c => client.user.setStatus("online"))
        .then(c => {
        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Client ready !`);
    })
        .catch(e => {
        console.error(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Error while setting client data `);
        console.error(e);
    });
});
client.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
    if (message.content === "!s cleanMessages") {
        if (!CAN_DELETE_MESSAGES) {
            console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] CanDelete is disabled.`);
            return;
        }
        const postedMessages = yield message.channel.fetchMessages({
            limit: 100,
        });
        const messagesToDelete = postedMessages.filter(m => m.author === client.user);
        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Deleting ${messagesToDelete.size} messages.`);
        for (let messageToDelete of messagesToDelete) {
            messageToDelete[1].delete();
        }
        return;
    }
    handle_message_1.handleMessage(message, ALLOW_MUMBLE);
}));
client.login(config.token)
    .then((str) => {
    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Client started.`);
})
    .catch((e) => {
    moment.now();
    console.error(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Error while starting client.`);
    console.error(e);
});
