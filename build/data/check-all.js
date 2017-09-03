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
const game_config_1 = require("./game-config");
const check_timer_1 = require("./check-timer");
const handle_night_1 = require("./handle-night");
const get_results_1 = require("./get-results");
const handle_vote_1 = require("./handle-vote");
function checkAll(forceEnd) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!game_config_1.gameConfig.channel)
            return;
        forceEnd = forceEnd || false;
        if (game_config_1.gameConfig.phase === "day") {
            const voters = game_config_1.gameConfig.allPlayers.filter(p => !game_config_1.gameConfig.badoozledPlayers.some(b => b === p));
            const remaining = voters.filter(t => game_config_1.gameConfig.votes[t.id] === undefined);
            console.log("Remaining votes : " + remaining.length);
            if (!forceEnd) {
                if (remaining.length > 0) {
                    const results = get_results_1.getVoteResults();
                    game_config_1.gameConfig.channel.send(`
Current votes : ${results.map(r => r.user ? `${r.user.username} (${r.count})` : `\`Skip the vote\` (${r.count})`).join(", ")}
There's still ${remaining.length} people who have to vote.
				`);
                    return;
                }
            }
            check_timer_1.clearTimer();
            game_config_1.gameConfig.channel.send(`Everybody has voted ! Here's the result.`);
            const results = get_results_1.getVoteResults();
            if (results.length > 1) {
                if (results[0].count === results[1].count) {
                    game_config_1.gameConfig.channel.send("This was a tie and nobody got mindbroken today.");
                    handle_night_1.handleNight();
                    return;
                }
                const target = results[0].user;
                if (target === null) {
                    game_config_1.gameConfig.channel.send("The majority voted to skip the vote.");
                    handle_night_1.handleNight();
                    return;
                }
                yield handle_vote_1.handleVote(target);
                game_config_1.gameConfig.badoozledPlayers.push(target);
                handle_night_1.handleNight();
                return;
            }
            const target = results[0].user;
            if (target === null) {
                game_config_1.gameConfig.channel.send("The majority voted to skip the vote.");
                handle_night_1.handleNight();
                return;
            }
            yield handle_vote_1.handleVote(target);
            game_config_1.gameConfig.badoozledPlayers.push(target);
            handle_night_1.handleNight();
            return;
        }
        if (game_config_1.gameConfig.phase === "night") {
            const voters = game_config_1.gameConfig.hypnotists.filter(p => !game_config_1.gameConfig.badoozledPlayers.some(b => b === p));
            const remaining = voters.filter(t => game_config_1.gameConfig.votes[t.id] === undefined);
            console.log("Remaining votes : " + remaining.length);
            if (!forceEnd) {
                if (remaining.length > 0) {
                    const results = get_results_1.getVoteResults();
                    for (let tist of voters)
                        tist.send(`
Current votes : ${results.map(r => r.user ? `${r.user.username} (${r.count})` : `\`Skip the vote\` (${r.count})`).join(", ")}
There's still ${remaining.length} people who have to vote.
					`);
                    return;
                }
            }
            check_timer_1.clearTimer();
            for (let tist of voters)
                tist.send(`Everybody has voted ! Here's the result.`);
            const results = get_results_1.getVoteResults();
            if (results.length > 1) {
                if (results[0].count === results[1].count) {
                    for (let tist of voters)
                        tist.send("The vote is closed. This was a tie and nobody got mindbroken today.");
                    handle_night_1.handleSpecialRole();
                    return;
                }
                const target = results[0].user;
                if (target === null) {
                    for (let tist of voters)
                        tist.send("The vote is closed. The majority voted to skip the night.");
                    handle_night_1.handleSpecialRole();
                    return;
                }
                yield handleTistEnd(target, voters);
                game_config_1.gameConfig.badoozledPlayers.push(target);
                game_config_1.gameConfig.recentlyBadoozled.push(target);
                handle_night_1.handleSpecialRole();
                return;
            }
            const target = results[0].user;
            if (target === null) {
                for (let tist of voters)
                    tist.send("The vote is closed. The majority voted to skip the night.");
                handle_night_1.handleSpecialRole();
                return;
            }
            yield handleTistEnd(target, voters);
            game_config_1.gameConfig.badoozledPlayers.push(target);
            game_config_1.gameConfig.recentlyBadoozled.push(target);
            handle_night_1.handleSpecialRole();
            return;
        }
    });
}
exports.checkAll = checkAll;
function handleTistEnd(target, voters) {
    return __awaiter(this, void 0, void 0, function* () {
        const targetNickname = yield game_config_1.getNickname(target);
        if (voters.length > 0) {
            if (target === voters[0]) {
                for (let tist of voters)
                    tist.send(`You pick a mirror, and look at yourself in the eyes. Carefully, you start the process of breaking your own mind.`);
                return;
            }
            for (let tist of voters)
                tist.send(`You sneak to ${targetNickname}'s house. Carefully, without waking them up, you whisper them into trance, where you start the process of breaking their mind.`);
            return;
        }
        if (voters.some(t => t === target)) {
            if (voters.length == 2) {
                const remainingTist = voters.filter(v => v !== target)[0];
                const tistNick = yield game_config_1.getNickname(remainingTist);
                for (let tist of voters)
                    tist.send(`${tistNick} meets ${targetNickname} at their house, where they trick them into trance. ${targetNickname}'s mind quickly gets melted.`);
            }
            for (let tist of voters.filter(v => v !== target))
                tist.send(`You and the other hypnotists sneak into ${targetNickname}'s house. With the ${voters.length - 1} of you, you restrain ${targetNickname} and begin the process of breaking their mind.`);
            target.send(`A bit surprised, you get thrown on your bed by an angry-looking team of ${voters.length - 1} hypnotists. Before you can scream, one of them shut your mouth with their hand, and all you can do is listen to their words and feel your mind slipping away.`);
            return;
        }
        for (let tist of voters)
            tist.send(`You sneak to ${targetNickname}'s house, where you find your fellow tists. With their help, you break ${targetNickname}'s mind.`);
        return;
    });
}
