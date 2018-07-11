
import { gameConfig } from "../data/game-config";
import { User } from "discord.js";

export function getVoteResults() {
    const results: Array<{user: User | null, count: number}> = [];
    for (let value in gameConfig.votes) {
        if (gameConfig.votes.hasOwnProperty(value)) {
            const target = gameConfig.votes[value];
            const targetPlayer = target === null ? null : gameConfig.allPlayers.filter(p => p.username === target)[0];
            const targetValues = results.filter(v => v.user === targetPlayer);
            if (targetValues.length > 0)
                targetValues[0].count += 1;
            else
                results.push({user: targetPlayer, count: 1});
        }
    }
    results.sort(function(a, b) {
        return b.count - a.count;
    });
    return results;
}
