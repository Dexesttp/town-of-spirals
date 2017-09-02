"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_config_1 = require("./game-config");
const check_all_1 = require("./check-all");
let timer;
function timerA() {
    game_config_1.sendChannelMessage("Two minutes remaining !");
    timer = setTimeout(() => {
        timerB();
    }, 90000);
}
exports.timerA = timerA;
function timerB() {
    game_config_1.sendChannelMessage("30s remaining !");
    timer = setTimeout(() => {
        check_all_1.checkAll(true);
        timer = null;
    }, 30000);
}
exports.timerB = timerB;
function clearTimer() {
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
}
exports.clearTimer = clearTimer;
