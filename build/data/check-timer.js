"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_config_1 = require("./game-config");
const check_all_1 = require("./check-all");
const moment = require("moment");
let timer = null;
function timerA() {
    if (!game_config_1.gameConfig.channel)
        return;
    game_config_1.gameConfig.channel.send("Five minutes remaining !");
    timer = setTimeout(() => {
        timerB();
    }, 270000);
}
exports.timerA = timerA;
function timerB() {
    if (!game_config_1.gameConfig.channel)
        return;
    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] 30s limit !`);
    game_config_1.gameConfig.channel.send("30s remaining !");
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
