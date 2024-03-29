import { PlayerData } from "../data/player";

function strEnum<T extends string>(o: T[]): { [K in T]: K } {
  return o.reduce((res, key) => {
    res[key] = key;
    return res;
  }, Object.create(null));
}

/** Create a K:V */
export const VoteResultType = strEnum([
  "MAJORITY_NO_VOTE",
  "UNANIMITY_NO_VOTE",
  "TIE",
  "MAJORITY",
  "UNANIMITY",
]);
/** Create a Type */
export type VoteResultType = keyof typeof VoteResultType;

export type VotingFlavour = {
  onWarnTimeout?: (timedout: PlayerData[]) => string;
  onVote?: (voter: PlayerData, target: PlayerData) => string;
  onNoVote?: (voter: PlayerData) => string;
  onNoVoteNotAllowed?: () => string;
  onCurrentVotes?: (
    results: Array<{ target: PlayerData | null; count: number }>
  ) => string;
};

export type VoteResult =
  | {
      /** If the timeout fired, list of people who didn't vote. */
      timedout: string[];
      /** Type of the vote result */
      type: "MAJORITY_NO_VOTE" | "UNANIMITY_NO_VOTE";
    }
  | {
      /** The tied targets. A "null" value represents a "no-vote" entry in the tie. */
      targets: Array<string | null>;
      /** If the timeout fired, list of people who didn't vote. */
      timedout: string[];
      /** Type of the vote result */
      type: "TIE";
    }
  | {
      /** The vote target */
      target: string;
      /** If the timeout fired, list of people who didn't vote. */
      timedout: string[];
      /** Type of the vote result */
      type: "MAJORITY" | "UNANIMITY";
    };

export type VoteConfig = {
  /** The voters. */
  voters: PlayerData[];
  /***
   * The potential vote targets.
   * Defaults to everybody.
   */
  targets?: PlayerData[];
  /** The timeout, in milliseconds. Defaults to 5 minutes (300 000). */
  timeout?: number;
  /**
   * The warning timeout, in milliseconds.
   * This will fire a "${time} remaining before vote ends !" warning sent to the same
   * chat the vote start message(s) is(are) sent to.
   * Defaults to 30s (30 000).
   */
  warnTimeout?: number;
  /**
   * Whether to use direct messages for voting and results.
   * This single option changes the initial voting message (shown only to the voters list via PMs),
   * the channel used for timeout warnings and the allowed reply channels.
   * Defaults to "main channel" (false).
   */
  sendDirectMessage?: boolean;
  /** Whether to disable the "no-vote" option. Defaults to allowed (true). */
  disableNoVote?: boolean;
  /** A method returning a list of rigged votes. Defaults to () => [] (no rigging). */
  rig?: (data: VotingData) => Array<{ voter: string; target: string | null }>;
  /**
   * The flavours to use for this vote and its results.
   * By default, the flavours will be debug messages. Make sure to change them !
   */
  flavour?: VotingFlavour;
};

export type VotingData = {
  /** The vote of a given voter. Set to "null" if the vote is "no-vote". */
  [voterID: string]: string | null | undefined;
};

export type VoteRequest = {
  /** The requester for the vote */
  voterID: string;
  /** The vote target :
   * string is a valid target ID
   * null is to vote for no target
   * undefined resets the voting state to "hasn't voted"
   */
  targetID: string | null | undefined;
};
