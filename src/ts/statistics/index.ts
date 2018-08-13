import { GameResult } from "../game";
import { PlayerData } from "../game/data/player";

export type StatsDataEntry = {
    name: string,
    wins: number,
    losses: number,
    roles: { [role: string]: number },
};

export type StatsData = {
    excluded: string[],
    saved: {
        [id: string]: StatsDataEntry,
    },
};

export function updateStatsInternal(
    data: StatsData,
    results: GameResult,
    players: PlayerData[],
) {
    for (const player of results) {
        if (data.excluded.some(e => e === player.id)) continue;
        const userData = players.filter(p => p.id === player.id)[0];
        if (!userData) continue;
        let playerData = data.saved[player.id];
        if (!playerData) {
            playerData = { name: userData.nickname, wins: 0, losses: 0, roles: {} };
            data.saved[player.id] = playerData;
        }
        playerData.name = userData.nickname;
        if (player.alive) playerData.wins += 1; else playerData.losses += 1;
        if (!playerData.roles[player.role])
            playerData.roles[player.role] = 0;
        playerData.roles[player.role] += 1;
    }
}

export function updateExcludedInternal(
    data: StatsData,
    id: string,
    exclude: boolean,
) {
    if (exclude) {
        if (data.excluded.some(d => d === id)) return false;
        data.excluded.push(id);
        delete data.saved[id];
        return true;
    }
    data.excluded = data.excluded.filter(d => d !== id);
    return true;
}

export function getLeaderboardInternal(stats: StatsData) {
    return Object.keys(stats.saved)
        .map(s => ({ id: s, name: stats.saved[s].name, wins: stats.saved[s].wins }))
        .sort((s1, s2) => s2.wins - s1.wins);
}

type UserStatsResult =
    { type: "noStatsFor", name: string }
    | { type: "noSelfStats" }
    | {
        type: "result",
        name: string,
        wins: number,
        losses: number,
        roles: Array<{ role: string, count: number }>,
    };

export function getUserStatsInternal(stats: StatsData, text: string, defaultId: string): UserStatsResult {
    const id = (() => {
        if (!text) return defaultId;
        for (let key in stats.saved) {
            if (!stats.saved.hasOwnProperty(key)) continue;
            if (key === text || stats.saved[key].name === text)
                return key;
        }
        return null;
    })();
    if (!id) return { type: "noStatsFor", name: text };
    const userstats = stats.saved[id];
    if (!userstats) return { type: "noSelfStats" };
    const roleList = Object.keys(userstats.roles)
        .map(r => ({ role: r, count: userstats.roles[r] }))
        .sort((s1, s2) => s2.count - s1.count);
    return {
        type: "result",
        ...userstats,
        roles: roleList,
    };
}
