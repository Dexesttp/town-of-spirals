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
const check_all_1 = require("../data/check-all");
const constants_1 = require("./constants");
function handleVote(message, voteTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        if (game_config_1.gameConfig.channel === null) {
            message.channel.send(`There's no game started yet ! Start a game with the \`${constants_1.CREATE_COMMAND}\` command.`);
            return;
        }
        if (!game_config_1.gameConfig.phase) {
            message.channel.send(`The game is not started ! Start it with the \`${constants_1.START_COMMAND}\` command.`);
        }
        if (!game_config_1.gameConfig.allPlayers.some(p => p === message.author)) {
            message.channel.send(`You're not playing the game, ${message.author.username}. Sorry.`);
            return;
        }
        if (game_config_1.gameConfig.phase === "night") {
            if (message.guild) {
                if (message.deletable)
                    yield message.delete();
                game_config_1.gameConfig.channel.send(`Don't vote here at night, but by DM !`);
                return;
            }
            if (game_config_1.gameConfig.badoozledPlayers.some(p => p === message.author)) {
                message.author.send(`Sorry, but you're not able to think at all, let alone cast a vote.`);
                return;
            }
            if (!game_config_1.gameConfig.hypnotists.some(p => p === message.author)) {
                message.author.send(`You're not a hypnotist. You should be asleep at night !`);
                return;
            }
            if (voteTarget) {
                var targets = game_config_1.gameConfig.allPlayers.filter(p => !game_config_1.gameConfig.badoozledPlayers.some(b => b === p));
                if (!targets.some(p => p.username === voteTarget)) {
                    message.author.send(`You can't vote for ${voteTarget}, they're not playing or already hypnotized. The available targets are : ${targets.map(t => t.username).join(", ")}`);
                    return;
                }
                var saneTists = game_config_1.gameConfig.hypnotists.filter(h => !game_config_1.gameConfig.badoozledPlayers.some(b => b === h));
                for (let tist of saneTists)
                    tist.send(`${message.author.username} voted for ${voteTarget}.`);
                game_config_1.gameConfig.votes[message.author.id] = voteTarget;
                check_all_1.checkAll();
                return;
            }
            var saneTists = game_config_1.gameConfig.hypnotists.filter(h => !game_config_1.gameConfig.badoozledPlayers.some(b => b === h));
            for (let tist of saneTists)
                tist.send(`${message.author.username} voted for to not target anybody.`);
            game_config_1.gameConfig.votes[message.author.id] = voteTarget;
            check_all_1.checkAll();
            return;
        }
        if (game_config_1.gameConfig.phase === "day") {
            if (!message.guild) {
                message.author.send(`By day, all votes are public.`);
                return;
            }
            if (game_config_1.gameConfig.badoozledPlayers.some(p => p === message.author)) {
                game_config_1.gameConfig.channel.send(`Sorry ${message.author.username}, but you're not able to think at all, let alone cast a vote.`);
                return;
            }
            if (voteTarget) {
                var targets = game_config_1.gameConfig.allPlayers.filter(p => !game_config_1.gameConfig.badoozledPlayers.some(b => b === p));
                if (!targets.some(p => p.username === voteTarget)) {
                    game_config_1.gameConfig.channel.send(`You can't vote for ${voteTarget}, they're not playing or already hypnotized. The available targets are : ${targets.map(t => t.username).join(", ")}`);
                    return;
                }
                game_config_1.gameConfig.channel.send(`${message.author.username} voted for ${voteTarget} !`);
                game_config_1.gameConfig.votes[message.author.id] = voteTarget;
                check_all_1.checkAll();
                return;
            }
            game_config_1.gameConfig.channel.send(`${message.author.username} voted to not target anybody !`);
            game_config_1.gameConfig.votes[message.author.id] = voteTarget;
            check_all_1.checkAll();
            return;
        }
    });
}
exports.handleVote = handleVote;
