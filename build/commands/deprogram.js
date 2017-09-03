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
const game_config_1 = require("../data/game-config");
const handle_night_1 = require("../data/handle-night");
const constants_1 = require("./constants");
let deprogrammer = null;
let hasSaved = [];
let hasBroken = [];
function reset() {
    deprogrammer = null;
    hasSaved = [];
    hasBroken = [];
}
exports.reset = reset;
function setDeprogrammer(user) {
    deprogrammer = user;
}
exports.setDeprogrammer = setDeprogrammer;
function canSave(user) {
    return !hasSaved.some(id => user.id === id);
}
exports.canSave = canSave;
function canBreak(user) {
    return !hasBroken.some(id => user.id === id);
}
exports.canBreak = canBreak;
function setBreak(message, targetName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (message.author !== deprogrammer)
            return;
        const alivePlayers = game_config_1.gameConfig.allPlayers.filter(p => !game_config_1.gameConfig.badoozledPlayers.some(b => p === b));
        let target = alivePlayers.filter(p => p.username === targetName)[0];
        if (!target) {
            target = alivePlayers.filter(p => p.username.toLowerCase() === targetName.toLowerCase())[0];
            if (!target) {
                message.author.send(`${targetName} is not a valid name. Valid targets are ${alivePlayers.map(p => p.username).join(", ")}`);
                return;
            }
        }
        const targetNickname = yield game_config_1.getNickname(target);
        yield message.author.send(`You go to ${targetNickname}'s house. While repeating to yourself that it's for the greater good, you use all your knowledge of conditioning to thoroughly break ${targetNickname}'s mind.`);
        yield message.author.send(`Leaving ${targetNickname} behind as comfortably as possible, you know that despite everything the hypnotists do you won't be able to do that again.`);
        hasBroken.push(message.author.id);
        game_config_1.gameConfig.badoozledPlayers.push(target);
        game_config_1.gameConfig.recentlyBadoozled.push(target);
        deprogrammer = null;
        handle_night_1.handleSpecialRole();
        return;
    });
}
exports.setBreak = setBreak;
function setSave(message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (message.author !== deprogrammer)
            return;
        if (!canSave(message.author)) {
            message.author.send(`You've lost your un-conditioning gear and can't save any more people.`);
            return;
        }
        const target = game_config_1.gameConfig.recentlyBadoozled[0];
        if (!target) {
            message.author.send(`Nobody has been broken tonight. Use \`${constants_1.SKIP_COMMAND}\` to skip the night.`);
            return;
        }
        const targetNickname = yield game_config_1.getNickname(target);
        yield message.author.send(`You go to ${targetNickname}'s house, where they appear to be sleeping peacefully - but you know what really is up. You set up your gear and spent an hour un-conditioning them.`);
        yield message.author.send(`Unfortunately, your gear break just as ${targetNickname} shuffles to wake up. You take what you can and leave hurriedly, but you won't be able to un-condition anybody else for a while.`);
        hasSaved.push(message.author.id);
        game_config_1.gameConfig.badoozledPlayers = game_config_1.gameConfig.badoozledPlayers.filter(t => t !== target);
        game_config_1.gameConfig.recentlyBadoozled = game_config_1.gameConfig.recentlyBadoozled.filter(t => t !== target);
        deprogrammer = null;
        handle_night_1.handleSpecialRole();
    });
}
exports.setSave = setSave;
function setSkip(message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (message.author !== deprogrammer)
            return;
        yield message.author.send(`Convinced that doing nothing for now is the right choice, you go to sleep.`);
        deprogrammer = null;
        handle_night_1.handleSpecialRole();
    });
}
exports.setSkip = setSkip;
