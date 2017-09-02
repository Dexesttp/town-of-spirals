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
const game_data_1 = require("../data/game-data");
const check_all_1 = require("../data/check-all");
const constants_1 = require("./constants");
function handleVote(message, voteTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        if (game_config_1.gameConfig.channel === null) {
            message.channel.send(`There's no game started yet ! Start a game with the \`${constants_1.CREATE_COMMAND}\` command.`);
            return;
        }
        if (!game_config_1.gameConfig.allPlayers.some(p => p === message.author)) {
            message.author.send("You're not playing the game. Sorry.");
            return;
        }
        if (game_data_1.gameData.phase === "night") {
            if (message.guild) {
                game_config_1.gameConfig.channel.send(`Don't vote here at night, but by DM !. I hope you like having your mind broken, though.`);
                return;
            }
            if (game_data_1.gameData.badoozledPlayers.some(p => p === message.author)) {
                message.author.send(`Sorry, but you're not able to think at all, let alone cast a vote.`);
                return;
            }
            if (!game_data_1.gameData.hypnotists.some(p => p === message.author)) {
                message.author.send(`You're not a hypnotist. You should be asleep at night !`);
                return;
            }
            var targets = game_config_1.gameConfig.allPlayers.filter(p => !game_data_1.gameData.badoozledPlayers.some(b => b === p));
            if (!targets.some(p => p.username === voteTarget)) {
                message.author.send(`You can't vote for ${voteTarget}, they're not playing or already hypnotized. The available targets are : ${targets.map(t => t.username).join(", ")}`);
                return;
            }
            message.author.send(`You voted for ${voteTarget}.`);
            game_data_1.gameData.votes[message.author.id] = voteTarget;
            check_all_1.checkAll();
            return;
        }
        if (game_data_1.gameData.phase === "day") {
            if (!message.guild) {
                message.author.send(`By day, all votes are public.`);
                return;
            }
            if (game_data_1.gameData.badoozledPlayers.some(p => p === message.author)) {
                game_config_1.gameConfig.channel.send(`Sorry <@${message.author.id}>, but you're not able to think at all, let alone cast a vote.`);
                return;
            }
            var targets = game_config_1.gameConfig.allPlayers.filter(p => !game_data_1.gameData.badoozledPlayers.some(b => b === p));
            if (!targets.some(p => p.username === voteTarget)) {
                game_config_1.gameConfig.channel.send(`You can't vote for ${voteTarget}, they're not playing or already hypnotized. The available targets are : ${targets.map(t => t.username).join(", ")}`);
                return;
            }
            game_data_1.gameData.votes[message.author.id] = voteTarget;
            game_config_1.gameConfig.channel.send(`<@${message.author.id}> voted for ${voteTarget} !`);
            check_all_1.checkAll();
            return;
        }
    });
}
exports.handleVote = handleVote;
