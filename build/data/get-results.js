"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_config_1 = require("../data/game-config");
function getVoteResults() {
    const results = [];
    for (let value in game_config_1.gameConfig.votes) {
        const target = game_config_1.gameConfig.votes[value];
        const targetPlayer = target === null ? null : game_config_1.gameConfig.allPlayers.filter(p => p.username === target)[0];
        const targetValues = results.filter(v => v.user === targetPlayer);
        if (targetValues.length > 0)
            targetValues[0].count += 1;
        else
            results.push({ user: targetPlayer, count: 1 });
    }
    results.sort(function (a, b) {
        return b.count - a.count;
    });
    return results;
}
exports.getVoteResults = getVoteResults;
