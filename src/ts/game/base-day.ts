import getRandom from "../utils/rand-from-array";
import { GameContext } from "./data/context";
import { PlayerData } from "./data/player";
import { BROKEN, BROKEN_DAY } from "./data/player-states";
import { GameTools } from "./data/tools";
import { GetAlivePlayers } from "./utils/alive-players";
import { VoteResultType, VotingFlavour } from "./vote/types";

export type DayFlavour = {
    intro?: (voteList: string[]) => string,
    vote?: VotingFlavour,
    break?: (target: PlayerData, owner: PlayerData) => string,
    dissent?: () => string,
    noVote?: () => string,
    roles?: { [role: string]: (target: PlayerData, roleList: string[]) => string },
    none?: (target: PlayerData) => string,
    unknown?: (target: PlayerData, roleList: string[]) => string,
};

export function baseDay(
    flavour: DayFlavour,
) {
    return async (
        context: GameContext,
        tools: GameTools,
    ) => {
        const voteList = GetAlivePlayers(context).map((p, i) => `[${i + 1}] ${p.nickname} (${p.username})`);
        const getIntroFlavour = flavour.intro || ((voteListInt: string[]) => `Tis a new day ! vote with \`!s vote\`.`);
        context.sendMessage(getIntroFlavour(voteList));
        const voteResult = await tools.startVote({
            voters: GetAlivePlayers(context),
            flavour: flavour.vote,
        });
        if (voteResult.type === VoteResultType.MAJORITY || voteResult.type === VoteResultType.UNANIMITY) {
            const targetPlayer = context.players.filter(p => p.id === voteResult.target)[0];
            targetPlayer.attributes.push(BROKEN);
            targetPlayer.attributes.push(BROKEN_DAY);
            const owner = getRandom(GetAlivePlayers(context), 1)[0];
            const getBreakFlavour = flavour.break || ((playerInt: PlayerData, ownerInt: PlayerData) =>
                `${playerInt.nickname} was chosen to be broken.`
            );
            await context.sendMessage(getBreakFlavour(targetPlayer, owner));
            // Reveals
            if (!context.reveal_roles)
                return;
            if (targetPlayer.roles.length === 0) {
                const getNoneRole = flavour.none
                    || ((target: PlayerData) => `<@${target.id}> was a normal citizen`);
                await context.sendMessage(getNoneRole(targetPlayer));
                return;
            }
            const getRole = (flavour.roles ? flavour.roles[targetPlayer.roles.join("_")] : undefined)
                || flavour.unknown
                || ((target: PlayerData, roleList: string[]) => `<@${target.id}> was a ${roleList.join(", ")}`);
            await context.sendMessage(getRole(targetPlayer, targetPlayer.roles));
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
