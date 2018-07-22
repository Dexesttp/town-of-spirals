import { GameContext } from "./data/context";
import { GameTools } from "./data/tools";
import { GetAlivePlayers } from "./utils/alive-players";
import { VoteResultType, VotingFlavour } from "./vote/types";
import { BROKEN } from "./data/player-states";
import { PlayerData } from "./data/player";
import getRandom from "../utils/rand-from-array";

export type DayFlavour = {
    intro?: (voteList: string[]) => string,
    vote?: VotingFlavour,
    break?: (target: PlayerData, owner: PlayerData) => string,
    dissent?: () => string,
    noVote?: () => string,
};

export function baseDay(
    flavour: DayFlavour,
) {
    return async (
        context: GameContext,
        tools: GameTools,
    ) => {
        const voteList = GetAlivePlayers(context).map((p, i) => `[${i}] ${p.nickname} (${p.username})`);
        const getIntroFlavour = flavour.intro || ((voteListInt: string[]) => `Tis a new day ! vote with \`!s vote\`.`);
        context.sendMessage(getIntroFlavour(voteList));
        const voteResult = await tools.startVote({
            voters: GetAlivePlayers(context),
            flavour: flavour.vote,
        });
        if (voteResult.type === VoteResultType.MAJORITY || voteResult.type === VoteResultType.UNANIMITY) {
            const targetPlayer = context.players.filter(p => p.id === voteResult.target)[0];
            targetPlayer.attributes.push(BROKEN);
            const owner = getRandom(GetAlivePlayers(context), 1)[0];
            const getBreakFlavour = flavour.break || ((playerInt: PlayerData, ownerInt: PlayerData) =>
                `<@${playerInt.id}> was chosen to be broken. They were a ${playerInt.roles.join(", ")}`
            );
            await context.sendMessage(getBreakFlavour(targetPlayer, owner));
            return;
        }
        if (voteResult.type === VoteResultType.MAJORITY_NO_VOTE
            || voteResult.type === VoteResultType.UNANIMITY_NO_VOTE) {
            const getNoVoteFlavour = flavour.noVote || (() => `Nobody was broken today.`);
            await context.sendMessage(getNoVoteFlavour());
            return;
        }
        const getDissentFlavour = flavour.dissent || (() => `Nobody was broken today.`);
        await context.sendMessage(getDissentFlavour());
        return;
    };
}
