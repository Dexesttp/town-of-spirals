import { PlayerData } from "../game/data/player";
import { GameResult } from "../game/data/context";

export type StatsDataEntry = {
    wins: number,
    losses: number,
    roles: { [role: string]: number },
};

export type StatsData = {
    excluded: string[],
    names: {
        [id: string]: { username: string, nickname: string },
    }
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
        // Update names
        data.names[player.id] = {
            username: userData.username,
            nickname: userData.nickname,
        };
        // Update stats
        let playerData = data.saved[player.id];
        if (!playerData) {
            playerData = { wins: 0, losses: 0, roles: {} };
            data.saved[player.id] = playerData;
        }
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
        .filter(s => !!stats.names[s])
        .map(s => ({ id: s, name: stats.names[s].nickname, wins: stats.saved[s].wins }))
        .sort((s1, s2) => s2.wins - s1.wins);
}

type UserStatsResultEntry = {
    name: string,
    wins: number,
    losses: number,
    roles: Array<{ role: string, count: number }>,
};

type UserStatsResult =
    { type: "noStatsFor", name: string }
    | { type: "noSelfStats" }
    | ({ type: "result" } & UserStatsResultEntry)
    | { type: "results", data: UserStatsResultEntry[] };

export function getUserStatsInternal(stats: StatsData, text: string, defaultId: string): UserStatsResult {
    function getFromID(id: string): UserStatsResultEntry | null {
        const userstats = stats.saved[id];
        const username = stats.names[id];
        if (!username || !userstats) return null;
        const roleList = Object.keys(userstats.roles)
        .map(r => ({ role: r || "citizen", count: userstats.roles[r] }))
        .sort((s1, s2) => s2.count - s1.count);
        return {
            name: username.nickname,
            ...userstats,
            roles: roleList,
        };
    }
    if (!text) {
        const defaultResult = getFromID(defaultId);
        if (defaultResult == null) return { type: "noSelfStats" };
        return {
            type: "result",
            ...defaultResult,
        };
    }

    const idList = Object.keys(stats.saved)
        .filter(key => {
            if (!stats.saved.hasOwnProperty(key)) return false;
            if (!stats.names.hasOwnProperty(key)) return false;
            return key === text
            || stats.names[key].username === text
            || stats.names[key].nickname === text;
        });
    const resultList = idList.map(getFromID).filter(r => !!r) as UserStatsResultEntry[];
    if (resultList.length === 0) {
        return { type: "noStatsFor", name: text };
    }
    if (resultList.length === 1) {
        const first = resultList[0];
        return {
            type: "result",
            ...first,
        };
    }
    return {
        type: "results",
        data: resultList,
    };
}
