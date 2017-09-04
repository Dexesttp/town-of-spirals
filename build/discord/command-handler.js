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
const timeout_1 = require("../utils/timeout");
let COMMAND_MATCHER = /^!s ([^\s]+)( (.+))?$/i;
let before = [];
let handlers = [];
function messageHandler(message) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let beforeHandler of before) {
            const result = yield beforeHandler(message);
            if (result)
                return;
        }
        const match = COMMAND_MATCHER.exec(message.content);
        if (match) {
            console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Received command : '${match[1]}'`);
            for (let handler of handlers) {
                if (handler.command !== match[1])
                    continue;
                const result = yield handler.handler(message, match[3]);
                if (result)
                    return;
            }
            const m = yield message.channel.send(`Unknown command : ${match[1]}`);
            yield timeout_1.timeout(3000);
            yield m.delete();
        }
    });
}
exports.messageHandler = messageHandler;
/**
 * Set a handler before the message is sent.
 * @param handler The before handler, should return true to block the message from being propagated.
 */
function onBefore(handler) {
    before.push(handler);
    return () => {
        before = before.filter(h => h !== handler);
    };
}
exports.onBefore = onBefore;
/**
 * Add a command to the thingy.
 * @param command the command to match against
 * @param handler The command handler, should return true to block the message from being propagated.
 */
function on(command, handler) {
    handlers.push({ command, handler });
    return () => {
        handlers = handlers.filter(h => h.command !== command || h.handler !== handler);
    };
}
exports.on = on;
