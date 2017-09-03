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
let detective = null;
function setDetective(user) {
    detective = user;
}
exports.setDetective = setDetective;
function handleSpy(message, targetName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (message.author !== detective)
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
        yield message.author.send(`You snoop up around ${targetName}'s house.`);
        if (game_config_1.gameConfig.hypnotists.some(h => h === target)) {
            yield message.author.send(`They're not in, and you can see them coming back after a while - carrying out a weird device. You're pretty sure ${targetName} is a hypnotist.`);
        }
        else if (game_config_1.gameConfig.specials[target.id] === "detective") {
            yield message.author.send(`They're not in, and you can see them snooping around another house. Could ${targetName} be a fellow detective ?`);
        }
        else if (game_config_1.gameConfig.specials[target.id] === "deprogrammer") {
            yield message.author.send(`Rhe lights in their home are still on. ${targetName} is working on a special device, and you find notes in their bin about "breaking conditioning". You're pretty sure they're a deprogrammer.`);
        }
        else {
            yield message.author.send(`${targetName} is at home, sleeping. Either they're very tired or they're just a normal citizen.`);
        }
        detective = null;
        handle_night_1.handleSpecialRole();
    });
}
exports.handleSpy = handleSpy;
