"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_config_1 = require("./game-config");
const game_data_1 = require("./game-data");
const check_timer_1 = require("./check-timer");
const handle_night_1 = require("./handle-night");
const handle_day_1 = require("./handle-day");
const get_results_1 = require("./get-results");
const rand_from_array_1 = require("../utils/rand-from-array");
const vote_flavour_1 = require("../flavours/vote-flavour");
function dayVoteResult(target) {
    const alivePlayers = game_config_1.gameConfig.allPlayers.filter(p => !game_data_1.gameData.badoozledPlayers.some(b => b === p));
    const owner = rand_from_array_1.default(alivePlayers, 1)[0];
    const flavour = rand_from_array_1.default(vote_flavour_1.voteFlavours, 1)[0];
    flavour(game_config_1.gameConfig.channel, target, owner);
}
function nightVoteResult(target) {
    for (let tist of game_data_1.gameData.hypnotists)
        tist.send(`You sneak to <@${target.id}>'s house, where you find your fellow tists. With their help, you break <@${target.id}>'s mind.`);
}
function checkAll(forceEnd) {
    forceEnd = forceEnd || false;
    if (game_data_1.gameData.phase === "day") {
        const voters = game_config_1.gameConfig.allPlayers.filter(p => !game_data_1.gameData.badoozledPlayers.some(b => b === p));
        const remaining = voters.filter(t => !game_data_1.gameData.votes[t.id]);
        console.log("Remaining votes : " + remaining.length);
        if (!forceEnd) {
            if (remaining.length > 0) {
                const results = get_results_1.getVoteResults();
                game_config_1.gameConfig.channel.send(`
Current votes : ${results.map(r => `${r[0].username} (${r[1]})`).join(", ")}
There's still ${remaining.length} people who have to vote.
				`);
                return;
            }
        }
        check_timer_1.clearTimer();
        game_config_1.gameConfig.channel.send(`Everybody has voted ! Here's the result.`);
        const results = get_results_1.getVoteResults();
        if (results.length > 1) {
            if (results[0][1] === results[1][1]) {
                game_config_1.gameConfig.channel.send("This was a tie and nobody got mindbroken today.");
                handle_night_1.handleNight();
                return;
            }
            const target = results[0][0];
            dayVoteResult(target);
            game_data_1.gameData.badoozledPlayers.push(target);
            handle_night_1.handleNight();
            return;
        }
        const target = results[0][0];
        dayVoteResult(target);
        game_data_1.gameData.badoozledPlayers.push(target);
        handle_night_1.handleNight();
        return;
    }
    if (game_data_1.gameData.phase === "night") {
        const voters = game_data_1.gameData.hypnotists.filter(p => !game_data_1.gameData.badoozledPlayers.some(b => b === p));
        const remaining = voters.filter(t => !game_data_1.gameData.votes[t.id]);
        console.log("Remaining votes : " + remaining.length);
        if (!forceEnd) {
            if (remaining.length > 0) {
                const results = get_results_1.getVoteResults();
                for (let tist of game_data_1.gameData.hypnotists)
                    tist.send(`
Current votes : ${results.map(r => `${r[0].username} (${r[1]})`).join(", ")}
There's still ${remaining.length} people who have to vote.
					`);
                return;
            }
        }
        check_timer_1.clearTimer();
        for (let tist of game_data_1.gameData.hypnotists)
            tist.send(`Everybody has voted ! Here's the result.`);
        const results = get_results_1.getVoteResults();
        if (results.length > 1) {
            if (results[0][1] === results[1][1]) {
                for (let tist of game_data_1.gameData.hypnotists)
                    tist.send("The vote is closed. This was a tie and nobody got mindbroken today.");
                handle_day_1.handleDay();
                return;
            }
            const target = results[0][0];
            nightVoteResult(target);
            game_data_1.gameData.badoozledPlayers.push(target);
            game_data_1.gameData.recentlyBadoozled.push(target);
            handle_day_1.handleDay();
            return;
        }
        const target = results[0][0];
        nightVoteResult(target);
        game_data_1.gameData.badoozledPlayers.push(target);
        game_data_1.gameData.recentlyBadoozled.push(target);
        handle_day_1.handleDay();
        return;
    }
}
exports.checkAll = checkAll;
