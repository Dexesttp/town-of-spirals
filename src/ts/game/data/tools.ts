import { CommandPromiseGetter } from "../command/types";
import { TargettingPromiseGetter } from "../targetCommand/types";
import { VoteConfig, VoteResult } from "../vote/types";

export type GameTools = {
    getCommandPromise: CommandPromiseGetter,
    getTargettingCommandPromise: TargettingPromiseGetter,
    startVote: (config: VoteConfig) => Promise<VoteResult>,
    cleanSubscribedCommands: () => void,
    cleanSubscribedTargettingCommands: () => void,
};
