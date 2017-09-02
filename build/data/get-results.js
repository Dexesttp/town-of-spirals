"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_data_1 = require("../data/game-data");
const game_config_1 = require("../data/game-config");
function getVoteResults() {
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
    return results;
}
exports.getVoteResults = getVoteResults;
