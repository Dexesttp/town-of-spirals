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
const client_1 = require("./discord/client");
const handle_message_1 = require("./handle-message");
const config = require("./config");
client_1.client.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
    if (message.content === "!s clean-messages") {
        if (!config.CAN_DELETE_MESSAGES) {
            console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] CanDelete is disabled.`);
            return;
        }
        const postedMessages = yield message.channel.fetchMessages({
            limit: 100,
        });
        const messagesToDelete = postedMessages.filter(m => m.author === client_1.client.user);
        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Deleting ${messagesToDelete.size} messages.`);
        for (let messageToDelete of messagesToDelete) {
            messageToDelete[1].delete();
        }
        return;
    }
    handle_message_1.handleMessage(message, config.ALLOW_MUMBLE, config.MUMBLE_SHOULD_EDIT);
}));
