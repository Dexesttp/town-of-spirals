import * as moment from "moment";
import { PlayerData } from "../data/player";
import { VoteConfig, VoteResult, VotingData } from "./types";
import { TimeoutPromise } from "../../utils/timer";
import { GetResults, GetVoteResults } from "./get-results";
import { GameContext } from "../data/context";
import { GetAlivePlayers } from "../utils/alive-players";

const DEFAULT_VOTE_TIMEOUT = 300000; // 5 minutes
const DEFAULT_VOTE_WARN_TIMEOUT = 30000; // 30s

export function startVoteFactory(
    context: GameContext,
    timerPromiseGetter: (timeout: number) => TimeoutPromise,
    // tslint:disable-next-line:max-line-length
    voteGenerator: (voters: PlayerData[], targets: PlayerData[], shouldBePrivate: boolean) => IterableIterator<Promise<{voterID: string, targetID: string | null | undefined}>>,
    sendMessage: (message: string, voters: PlayerData[], sendDirectMessage?: boolean) => void,
) {
    return function startVote(config: VoteConfig): Promise<VoteResult> {
        return new Promise((resolve, reject) => {
            const votingData: VotingData = {};
            const targets = config.targets || GetAlivePlayers(context);
            const fullTimeout = config.timeout || DEFAULT_VOTE_TIMEOUT;
            const warnTimeout = config.warnTimeout || DEFAULT_VOTE_WARN_TIMEOUT;
            if (fullTimeout < warnTimeout)
                throw new TypeError(`The vote timeout ${fullTimeout} is less than the warn timeout ${warnTimeout}`);

            let ended = false;
            let timeout = timerPromiseGetter(fullTimeout - warnTimeout);
            timeout.then(() => {
                if (ended) return;
                const votes = GetResults(config.voters.map(v => v.id), targets.map(t => t.id), votingData);
                sendMessage(
                    // tslint:disable-next-line:max-line-length
                    `${votes.timedout.map(id => `<@${id}>`).join(", ")} : ${moment.duration(warnTimeout).humanize()} remaining before vote ends !`,
                    config.voters, config.sendDirectMessage,
                );
                timeout = timerPromiseGetter(warnTimeout);
                timeout.then(() => {
                    if (ended) return;
                    ended = true;
                    const riggedVoteResult = GetResults(
                        config.voters.map(v => v.id),
                        targets.map(t => t.id),
                        votingData,
                        config.rig ? config.rig(votingData) : undefined,
                    );
                    resolve(riggedVoteResult);
                })
                .catch(() => {/* NO OP */});
            })
            .catch(() => {/* NO OP */});

            // Get all the votes sent by the players.
            const iterator = voteGenerator(config.voters, targets, !!config.sendDirectMessage);
            const handleVote = (
                reply?: {voterID: string, targetID: string | null | undefined},
            ) => {
                // Break now if the vote is already ended.
                if (ended) return;
                // Exclusion for starting case
                if (reply) {
                    const voter = config.voters.filter(v => v.id === reply.voterID)[0];
                    if (voter === null) {
                        reject(new Error(`The voter ${reply.voterID} is not in the voters list.`));
                        return;
                    }
                    if (reply.targetID) {
                        const target = targets.filter(t => t.id === reply.targetID)[0];
                        if (!target) {
                            reject(new Error(`The target ${reply.targetID} is not in the target list.`));
                            return;
                        }
                        sendMessage(
                            `${voter.nickname} voted for ${target.nickname} !`,
                            config.voters,
                            config.sendDirectMessage,
                        );
                    }
                    else if (reply.targetID === null) {
                        sendMessage(
                            `${voter.nickname} chose not to target anybody.`,
                            config.voters,
                            config.sendDirectMessage,
                        );
                    }
                    // Register the vote
                    votingData[reply.voterID] = reply.targetID;
                    // Compute the vote state
                    const voteResult = GetResults(
                        config.voters.map(v => v.id),
                        targets.map(t => t.id),
                        votingData,
                    );
                    // Break only if everybody has voted.
                    if (voteResult.timedout.length === 0) {
                        ended = true;
                        // Stop the timeout timer
                        if (timeout.cancel)
                            timeout.cancel();
                        const riggedVoteResult = GetResults(
                            config.voters.map(v => v.id),
                            targets.map(t => t.id),
                            votingData,
                            config.rig ? config.rig(votingData) : undefined,
                        );
                        // Return.
                        resolve(riggedVoteResult);
                        return;
                    }
                    else {
                        try {
                            // Get the current progress
                            const results = GetVoteResults(votingData)
                            .map(v => {
                                if (v.userID === null) {
                                    return { target: null, count: v.count };
                                }
                                const target = targets.filter(t => t.id === v.userID)[0];
                                if (!target) {
                                    throw new Error(`Vote target ${v.userID} is not a valid target.`);
                                }
                                return { target, count: v.count };
                            });
                            sendMessage(
                                `Current votes are : ${results.map(r => {
                                    if (r.target === null)
                                        return `\`No vote\` (${r.count})`;
                                    return `${r.target.nickname} (${r.count})`;
                                }).join(", ")}`,
                                config.voters,
                                config.sendDirectMessage,
                            );
                        } catch (e) {
                            reject(e);
                        }
                    }
                }

                // Get the next vote promise.
                const value = iterator.next();
                if (value.done) return;
                value.value.then(r => {
                    handleVote(r);
                }).catch(() => {
                    handleVote();
                });
            };
            handleVote();
        });
    };
}
