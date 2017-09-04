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
const load_flavours_1 = require("../flavours/load-flavours");
const game_config_1 = require("../data/game-config");
const rand_from_array_1 = require("../utils/rand-from-array");
let mumbles = [];
function mumbleMessage(message, mumbleShouldEdit) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!mumbleShouldEdit && message.deletable)
            message.delete().catch(e => { });
        game_config_1.getNickname(message.author)
            .then(nickname => {
            const name = nickname || message.author.username;
            const flavour = rand_from_array_1.default(load_flavours_1.mumbleFlavours, 1)[0];
            if (mumbleShouldEdit) {
                return message.edit(flavour(name, ''));
            }
            return (game_config_1.gameConfig.channel || message.channel).send(flavour(name, ''));
        })
            .then(m => {
            const userID = message.author.id;
            const previousMumblesFrom = mumbles.filter(m => m.userID === userID && m.message.deletable);
            mumbles.push({ userID, message: m });
            return Promise.all(previousMumblesFrom.map(p => p.message.delete()));
        })
            .catch(e => console.error(`Could not edit message properly : ${JSON.stringify(e)}`));
    });
}
exports.mumbleMessage = mumbleMessage;
