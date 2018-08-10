import { startVoteFactory } from "../../../ts/game/vote";
import { TimerPromise } from "../../../ts/utils/timer";
import { VoteRequest } from "../../../ts/game/vote/types";

export function GetVoteFactory(
    votes: VoteRequest[],
) {
    return startVoteFactory(
        { players: [], playerInterface: {}, sendMessage: async () => { } },
        (t) => TimerPromise(1),
        function* (v, t, shouldBePrivate) {
            for (const vote of votes) {
                yield Promise.resolve<VoteRequest>(vote);
            }
        },
        (m, voters, toEveryone) => { /* NO OP */ },
    );
}
