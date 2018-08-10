import { VotingData, VoteResult, VoteResultType } from "./types";

export function GetVoteResults(
    votingData: VotingData,
    riggedVotes?: Array<{ voter: string, target: string | null }>,
) {
    /** list of userID to vote count associations */
    const results: Array<{ userID: string | null, count: number }> = [];
    for (let value in votingData) {
        if (votingData.hasOwnProperty(value)) {
            const targetID = votingData[value];
            if (targetID === undefined)
                continue;
            const riggedTargetID = riggedVotes
                ? riggedVotes.filter(v => v.voter === value).map(v => v.target)[0]
                : undefined;
            const actualTargetID = riggedTargetID === undefined ? targetID : riggedTargetID;
            const targetValues = results.filter(v => v.userID === actualTargetID);
            if (targetValues.length > 0)
                targetValues[0].count += 1;
            else
                results.push({ userID: actualTargetID, count: 1 });
        }
    }
    results.sort((a, b) => b.count - a.count);
    return results;
}

export function GetResults(
    voterIDs: string[],
    targetIDs: string[],
    votingData: VotingData,
    riggedVotes?: Array<{ voter: string, target: string | null }>,
): VoteResult {
    const results = GetVoteResults(votingData, riggedVotes);
    const timedout = voterIDs.filter(id => votingData[id] === undefined);
    // If nobody voted, this is a tie with all the available targets
    if (!results.length) {
        return {
            targets: targetIDs,
            timedout,
            type: VoteResultType.TIE,
        };
    }
    // get the count of the first target
    const leadingCount = results[0].count;
    const voteLeaders = results.filter(r => r.count === leadingCount);
    // if it's a tie.
    if (voteLeaders.length > 1) {
        return {
            targets: voteLeaders.map(l => l.userID),
            timedout,
            type: VoteResultType.TIE,
        };
    }
    const voteResult = voteLeaders[0].userID;
    if (voteResult === null) {
        return {
            timedout,
            type: (leadingCount === voterIDs.length)
                ? VoteResultType.UNANIMITY_NO_VOTE
                : VoteResultType.MAJORITY_NO_VOTE,
        };
    }
    return {
        target: voteResult,
        timedout,
        type: (leadingCount === voterIDs.length)
            ? VoteResultType.UNANIMITY
            : VoteResultType.MAJORITY,
    };
}
