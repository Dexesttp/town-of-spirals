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
exports.gameConfig = {
    allPlayers: [],
    channel: null,
    gameStarter: null,
};
function sendChannelMessage(message) {
    exports.gameConfig.channel.send(message);
}
exports.sendChannelMessage = sendChannelMessage;
function getNickname(author) {
    return __awaiter(this, void 0, void 0, function* () {
        const guildUser = yield exports.gameConfig.channel.guild.fetchMember(author);
        return guildUser.nickname || author.username;
    });
}
exports.getNickname = getNickname;
