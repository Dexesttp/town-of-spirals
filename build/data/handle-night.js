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
const check_end_1 = require("./check-end");
const game_config_1 = require("./game-config");
const constants_1 = require("../commands/constants");
const check_timer_1 = require("./check-timer");
const handle_day_1 = require("./handle-day");
const spy_1 = require("../commands/spy");
const deprogram_1 = require("../commands/deprogram");
const moment = require("moment");
let remainingSpecialRoles = [];
function handleNight() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!game_config_1.gameConfig.channel)
            return;
        if (yield check_end_1.checkEnd())
            return;
        game_config_1.gameConfig.phase = "night";
        game_config_1.gameConfig.channel.send(`A new night falls on the town.`);
        game_config_1.gameConfig.recentlyBadoozled = [];
        const aliveVillagers = game_config_1.gameConfig.allPlayers.filter(h => !game_config_1.gameConfig.badoozledPlayers.some(b => b === h));
        var saneTists = game_config_1.gameConfig.hypnotists.filter(h => !game_config_1.gameConfig.badoozledPlayers.some(b => b === h));
        for (let tist of saneTists) {
            tist.send(`
The night has fallen. Vote for a new victim with \`${constants_1.VOTE_COMMAND}\` (without the {}s please. E.g. : \`!s vote Jk\`), or \`${constants_1.VOTE_NB_COMMAND}\`
The available targets for tonight are : ${aliveVillagers.map((v, id) => `[${id}] ${v.username}`).join(", ")}.
As a reminder, your colleagues are : ${saneTists.map(v => v.username).join(", ")}.
		`);
        }
        remainingSpecialRoles = [];
        for (let userID in game_config_1.gameConfig.specials) {
            const user = game_config_1.gameConfig.allPlayers.filter(u => !game_config_1.gameConfig.badoozledPlayers.some(b => b === u)
                && u.id === userID)[0];
            if (!user)
                continue;
            remainingSpecialRoles.push({ user, role: game_config_1.gameConfig.specials[userID] });
        }
        game_config_1.gameConfig.votes = {};
        check_timer_1.timerA();
        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Night time !`);
    });
}
exports.handleNight = handleNight;
function handleSpecialRole() {
    return __awaiter(this, void 0, void 0, function* () {
        const special = remainingSpecialRoles.pop();
        if (!special) {
            handle_day_1.handleDay();
            return;
        }
        const alivePlayers = game_config_1.gameConfig.allPlayers.filter(p => !game_config_1.gameConfig.badoozledPlayers.some(b => p === b)).map(u => u.username);
        if (special.role === "detective") {
            console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Detective time !`);
            spy_1.setDetective(special.user);
            special.user.send(`Time to snoop up on somebody ! Use \`${constants_1.SPY_COMMAND}\` to spy on a target (without the curly brackets please).`);
            special.user.send(`You can spy on ${alivePlayers.join(", ")}.`);
            return;
        }
        if (special.role === "deprogrammer") {
            const victim = game_config_1.gameConfig.recentlyBadoozled[0];
            const saveAllowed = deprogram_1.canSave(special.user);
            const breakAllowed = deprogram_1.canBreak(special.user);
            if (!breakAllowed && (!victim || !saveAllowed)) {
                handleSpecialRole();
                return;
            }
            console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Deprogrammer time ! Remaining save : ${saveAllowed}, remaining break: ${breakAllowed}`);
            deprogram_1.setDeprogrammer(special.user);
            if (victim && saveAllowed)
                special.user.send(`It appears ${victim.username} had their mind broken ! Use \`${constants_1.SAVE_COMMAND}\` to save them.`);
            if (breakAllowed)
                special.user.send(`You can use the \`${constants_1.BREAK_COMMAND}\` and your knowledge of conditioning to break somebody arbitrarily. Possible targets are ${alivePlayers.join(", ")}`);
            special.user.send(`You can also use the ${constants_1.SKIP_COMMAND} to do nothing.`);
            return;
        }
    });
}
exports.handleSpecialRole = handleSpecialRole;
