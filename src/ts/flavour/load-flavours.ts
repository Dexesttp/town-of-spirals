import * as yaml from "js-yaml";
import { readFileSync } from "fs";
import { VotingFlavour } from "../game/vote/types";
import { PlayerData } from "../game/data/player";
import getRandom from "../utils/rand-from-array";

export function LoadYamlFile(fileName: string): any {
    return yaml.safeLoad(readFileSync(fileName).toString());
}

export const mumbleFlavours: Array<(userName: string, ownerName: string) => string>
= LoadYamlFile("strings/classic/mumble.yaml").mumble.map((text: string) => (target: string, owner: string) =>
    text.replace(/\[target\]/ig, target).replace(/\[owner\]/ig, owner),
);

export function FormatPlayer(player: PlayerData, rawText: string) {
    return rawText
        .replace(/\[player\]/ig, `${player.nickname}`)
        .replace(/\[playerMention\]/ig, `<@${player.id}>`);
}

export function FormatTarget(target: PlayerData, rawText: string) {
    return rawText
        .replace(/\[target\]/ig, `${target.nickname}`)
        .replace(/\[targetMention\]/ig, `<@${target.id}>`);
}

export function FormatOwner(owner: PlayerData, rawText: string) {
    return rawText
        .replace(/\[owner\]/ig, `${owner.nickname}`)
        .replace(/\[ownerMention\]/ig, `<@${owner.id}>`);
}


export function FormatPlayerList(players: PlayerData[], rawText: string) {
    return rawText
        .replace(/\[playerList\]/ig, players.map(t => t.nickname).join(", "))
        .replace(/\[playerMentionList\]/ig, players.map(t => `<@${t.id}>`).join(" "));
}

export function FormatTargetList(targets: PlayerData[], rawText: string) {
    return rawText
        .replace(/\[targetList\]/ig, targets.map(t => t.nickname).join(", "))
        .replace(/\[targetMentionList\]/ig, targets.map(t => `<@${t.id}>`).join(" "));
}

export function LoadToggledData<T extends any[], U>(
    data: any,
    method: (rawData: U, ...params: T) => string,
): (count: number) => (...params: T) => string {
    return (count) => {
        const contentData = data[count] ? data[count] : data["multi"];
        if (!contentData) return (...params) => "'multi' entry not found for data";
        return (...params) => {
            return method(contentData as U, ...params);
        };
    };
}

export function LoadVoteFlavour(data: any): VotingFlavour {
    //#region Warn Timeout
    function FormatWarnTimeout(targets: PlayerData[], rawText: string): string {
        return FormatPlayerList(targets, rawText)
            .replace(/\[time\]/ig, "30 seconds");
    }
    let warnTimeoutFunction: ((timedout: PlayerData[]) => string) | undefined = undefined;
    const warnTimeoutData = data.warnTimeout;
    if (warnTimeoutData) {
        if (Array.isArray(warnTimeoutData)) {
            const warnTimeoutArray: string[] = warnTimeoutData;
            warnTimeoutFunction = timedout => {
                const rawText = getRandom(warnTimeoutArray, 1)[0];
                return FormatWarnTimeout(timedout, rawText);
            };
        }
        else {
            warnTimeoutFunction = timedout => {
                return FormatWarnTimeout(timedout, warnTimeoutData as string);
            };
        }
    }
    //#endregion

    //#region Vote
    function FormatVote(voter: PlayerData, target: PlayerData, rawText: string): string {
        return FormatTarget(target, FormatPlayer(voter, rawText));
    }
    let voteFunction: ((voter: PlayerData, target: PlayerData) => string) | undefined = undefined;
    const voteData = data.onVote;
    if (voteData) {
        if (Array.isArray(voteData)) {
            const voteArray: string[] = voteData;
            voteFunction = (voter, target) => {
                const rawText = getRandom(voteArray, 1)[0];
                return FormatVote(voter, target, rawText);
            };
        }
        else {
            voteFunction = (voter, target) => {
                return FormatVote(voter, target, voteData as string);
            };
        }
    }
    //#endregion

    //#region No Vote
    function FormatNoVote(voter: PlayerData, rawText: string): string {
        return FormatPlayer(voter, rawText);
    }
    let noVoteFunction: ((voter: PlayerData) => string) | undefined = undefined;
    const noVoteData = data.onNoVote;
    if (noVoteData) {
        if (Array.isArray(noVoteData)) {
            const voteArray: string[] = noVoteData;
            noVoteFunction = (voter) => {
                const rawText = getRandom(voteArray, 1)[0];
                return FormatNoVote(voter, rawText);
            };
        }
        else {
            noVoteFunction = (voter) => {
                return FormatNoVote(voter, noVoteData as string);
            };
        }
    }
    //#endregion

    //#region No Vote not allowed
    let noVoteNotAllowedFunction: (() => string) | undefined = undefined;
    const noVoteNotAllowedData = data.onNoVoteNotAllowed;
    if (noVoteNotAllowedData) {
        if (Array.isArray(noVoteNotAllowedData)) {
            const voteArray: string[] = noVoteNotAllowedData;
            noVoteNotAllowedFunction = () => {
                return getRandom(voteArray, 1)[0];
            };
        }
        else {
            noVoteNotAllowedFunction = () => {
                return noVoteNotAllowedData as string;
            };
        }
    }
    //#endregion

    //#region Current votes
    function FormatCurrentVotes(results: Array<{ target: PlayerData | null, count: number }>, rawText: string): string {
        return rawText
            .replace(
                /\[resultsList\]/ig,
                results
                    .map(r => r.target ? `@${r.target.nickname} (${r.count})` : `Nobody (${r.count})`)
                    .join(", "),
            );
    }
    let currentVotesFunction: ((results: Array<{ target: PlayerData | null, count: number }>) => string) | undefined = undefined;
    const currentVotesData = data.onNoVoteNotAllowed;
    if (currentVotesData) {
        if (Array.isArray(currentVotesData)) {
            const voteArray: string[] = currentVotesData;
            currentVotesFunction = (results) => {
                const rawText = getRandom(voteArray, 1)[0];
                return FormatCurrentVotes(results, rawText);
            };
        }
        else {
            currentVotesFunction = (results) => {
                return FormatCurrentVotes(results, noVoteData as string);
            };
        }
    }
    //#endregion

    return {
        onWarnTimeout: warnTimeoutFunction,
        onVote: voteFunction,
        onNoVote: noVoteFunction,
        onNoVoteNotAllowed: noVoteNotAllowedFunction,
        onCurrentVotes: currentVotesFunction,
    };
}

