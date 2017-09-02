"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_config_1 = require("./game-config");
const game_data_1 = require("./game-data");
const check_timer_1 = require("./check-timer");
const handle_night_1 = require("./handle-night");
const handle_day_1 = require("./handle-day");
function checkAll(forceEnd) {
    forceEnd = forceEnd || false;
    if (game_data_1.gameData.phase === "day") {
        const voters = game_config_1.gameConfig.allPlayers.filter(p => !game_data_1.gameData.badoozledPlayers.some(b => b === p));
        const remaining = voters.filter(t => !game_data_1.gameData.votes[t]);
        console.log("Remaining votes : " + remaining.length);
        if (!forceEnd) {
            if (remaining.length > 0) {
                game_config_1.gameConfig.channel.send(`There's still ${remaining.length} people who have to vote.`);
                return;
            }
        }
        check_timer_1.clearTimer();
        game_config_1.gameConfig.channel.send(`Everybody has voted ! Here's the result.`);
        /** @type {[any, number][]} */
        const results = [];
        for (let value in game_data_1.gameData.votes) {
            const target = game_data_1.gameData.votes[value];
            const targetPlayer = game_config_1.gameConfig.allPlayers.filter(p => p.username === target)[0];
            const targetValues = results.filter(v => v[0] === targetPlayer);
            if (targetValues.length > 0)
                targetValues[0][1] += 1;
            else
                results.push([targetPlayer, 1]);
        }
        results.sort(function (a, b) {
            return b[1] - a[1];
        });
        if (results.length > 1) {
            if (results[0][1] === results[1][1]) {
                game_config_1.gameConfig.channel.send("This was a tie and nobody got mindbroken today.");
                handle_night_1.handleNight();
                return;
            }
            const target = results[0][0];
            game_config_1.gameConfig.channel.send(`<@${target.id}> has been chosen as the victim.`);
            game_config_1.gameConfig.channel.send(`The town gather as <@${target.id}> is brought to the chair.`);
            game_config_1.gameConfig.channel.send(`The chair begins its magic, and <@${target.id}> slowly feels their mind sleeping away.`);
            game_config_1.gameConfig.channel.send(`After a while, they're let free to wander around, not able to think anymore.`);
            game_data_1.gameData.badoozledPlayers.push(target);
            handle_night_1.handleNight();
            return;
        }
        const target = results[0][0];
        game_config_1.gameConfig.channel.send(`<@${target.id}> has been chosen as the victim.`);
        game_config_1.gameConfig.channel.send(`The town gather as <@${target.id}> is brought to the chair.`);
        game_config_1.gameConfig.channel.send(`The chair begins its magic, and <@${target.id}> slowly feels their mind sleeping away.`);
        game_config_1.gameConfig.channel.send(`After a while, they're let free to wander around, not able to think anymore.`);
        game_data_1.gameData.badoozledPlayers.push(target);
        handle_night_1.handleNight();
        return;
    }
    if (game_data_1.gameData.phase === "night") {
        const voters = game_data_1.gameData.hypnotists.filter(p => !game_data_1.gameData.badoozledPlayers.some(b => b === p));
        const remaining = voters.filter(t => !game_data_1.gameData.votes[t]);
        console.log("Remaining votes : " + remaining.length);
        if (!forceEnd) {
            if (remaining.length > 0) {
                let currentVotes = [];
                for (let vote in game_data_1.gameData.votes) {
                    currentVotes.push(game_data_1.gameData.votes[vote]);
                }
                for (let tist of game_data_1.gameData.hypnotists)
                    tist.send(`There's still ${remaining.length} people who have to vote. Current votes : ${currentVotes.join(", ")}.`);
                return;
            }
        }
        check_timer_1.clearTimer();
        for (let tist of game_data_1.gameData.hypnotists)
            tist.send(`Everybody has voted ! Here's the result.`);
        /** @type {[any, number][]} */
        const results = [];
        for (let value in game_data_1.gameData.votes) {
            const target = game_data_1.gameData.votes[value];
            const targetPlayer = game_config_1.gameConfig.allPlayers.filter(p => p.username === target)[0];
            const targetValues = results.filter(v => v[0] === targetPlayer);
            if (targetValues.length > 0)
                targetValues[0][1] += 1;
            else
                results.push([targetPlayer, 1]);
        }
        results.sort(function (a, b) {
            return b[1] - a[1];
        });
        if (results.length > 1) {
            if (results[0][1] === results[1][1]) {
                for (let tist of game_data_1.gameData.hypnotists)
                    tist.send("The vote is closed. This was a tie and nobody got mindbroken today.");
                handle_day_1.handleDay();
                return;
            }
            const target = results[0][0];
            for (let tist of game_data_1.gameData.hypnotists)
                tist.send(`You sneak to <@${target.id}>'s house, where you find your fellow tists. With their help, you break <@${target.id}>'s mind.`);
            game_data_1.gameData.badoozledPlayers.push(target);
            game_data_1.gameData.recentlyBadoozled.push(target);
            handle_day_1.handleDay();
            return;
        }
        const target = results[0][0];
        for (let tist of game_data_1.gameData.hypnotists)
            tist.send(`You sneak to <@${target.id}>'s house, where you find your fellow tists. With their help, you break <@${target.id}>'s mind.`);
        game_data_1.gameData.badoozledPlayers.push(target);
        game_data_1.gameData.recentlyBadoozled.push(target);
        handle_day_1.handleDay();
        return;
    }
}
exports.checkAll = checkAll;
