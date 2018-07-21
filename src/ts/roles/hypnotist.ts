import { GameContext } from "../game/data/context";
import { GetAlivePlayers } from "../game/utils/alive-players";
import { VoteResultType, VotingFlavour } from "../game/vote/types";
import { GameTools } from "../game/data/tools";
import { BROKEN_NIGHT } from "../game/data/player-states";
import { PlayerData } from "../game/data/player";
import getRandom from "../utils/rand-from-array";

export const HYPNOTIST_ROLE = "hypnotist";

type HypnotistFlavourBreakTist = (count: number) => (target: PlayerData, owner: PlayerData, count: number) => string;
type HypnotistFlavourBreak = (count: number) => (target: PlayerData) => string;
type HypnotistFlavourSkip = (count: number) => (playerList: PlayerData[]) => string;

export type HypnotistFlavourList = {
    intro?: (playerList: PlayerData[], voteList: string[]) => string,
    vote?: VotingFlavour,
    breakTist?: HypnotistFlavourBreakTist,
    brokenTist?: HypnotistFlavourBreakTist,
    breakOther?: HypnotistFlavourBreak,
    noVote?: HypnotistFlavourSkip,
    dissent?: HypnotistFlavourSkip,
};

export function handleHypnotist(
    flavours: HypnotistFlavourList,
) {
    return async (
        context: GameContext,
        tools: GameTools,
    ) => {
        const hypnotists = GetAlivePlayers(context).filter(p => p.roles.some(r => r === HYPNOTIST_ROLE));
        const targets = GetAlivePlayers(context).filter(p => !p.attributes.some(a => a === BROKEN_NIGHT));
        const hypnotistInterfaces = hypnotists.map(h => context.playerInterface[h.id]);
        const voteList = targets.map((t, i) => `[${i}] ${t.nickname} (${t.username})`);
        const getIntroFlavour = flavours.intro || (
            (playerListInt: PlayerData[], voteListInt: string[]) =>
            `Breaking time ! Choose one person to target with \`!s vote\`. The available targets are : ${voteListInt.join(", ")}`
        );
        hypnotistInterfaces.forEach(f => f.sendMessage(getIntroFlavour(hypnotists, voteList)));

        const voteResult = await tools.startVote({
            voters: hypnotists,
            targets,
            timeout: 300000, // 5mn timeout
            warnTimeout: 30000, // 30s timeout warning
            sendDirectMessage: true,
            flavour: flavours.vote,
        });

        if (voteResult.type === VoteResultType.MAJORITY
            || voteResult.type === VoteResultType.UNANIMITY) {
            const targetID = voteResult.target;
            const target = context.players.filter(p => p.id === targetID)[0];
            target.attributes.push(BROKEN_NIGHT);
            if (hypnotists.some(h => h.id === targetID)) {
                const otherTists = hypnotists.filter(h => h.id !== targetID);
                const owner = getRandom(otherTists, 1)[0];
                const getBrokenTistFlavour = flavours.brokenTist || (
                    (count: number) =>
                    (targetInt: PlayerData, ownerInt: PlayerData, countInt: number) =>
                    `You were broken by ${ownerInt.nickname}.`
                );
                const getBreakTistFlavour = flavours.breakTist || (
                    (count: number) =>
                    (targetInt: PlayerData, ownerInt: PlayerData, countInt: number) =>
                    `You broke ${targetInt.nickname}.`
                );
                context.playerInterface[targetID].sendMessage(getBrokenTistFlavour(hypnotists.length)(target, owner, hypnotists.length));
                otherTists.map(h => context.playerInterface[h.id])
                    .forEach(f => f.sendMessage(getBreakTistFlavour(hypnotists.length)(target, owner, hypnotists.length)));
                return;
            }

            const betBreakOtherFlavour = flavours.breakOther || (
                (count: number) =>
                (targetInt: PlayerData) =>
                `You broke ${targetInt.nickname}.`
            );
            hypnotistInterfaces.forEach(f => f.sendMessage(betBreakOtherFlavour(hypnotists.length)(target)));
            return;
        }

        if (voteResult.type === VoteResultType.MAJORITY_NO_VOTE
            || voteResult.type === VoteResultType.UNANIMITY_NO_VOTE) {
            const getSkipFlavour = flavours.noVote || (
                (count: number) => (playerListInt: PlayerData[]) => `You broke nobody.`
            );
            hypnotistInterfaces.forEach(f => f.sendMessage(getSkipFlavour(hypnotists.length)(hypnotists)));
            return;
        }

        if (voteResult.type === VoteResultType.TIE) {
            const getDissentFlavour = flavours.dissent || (
                (count: number) => (playerListInt: PlayerData[]) => `You broke nobody.`
            );
            hypnotistInterfaces.forEach(f => f.sendMessage(getDissentFlavour(hypnotists.length)(hypnotists)));
            return;
        }
    };
}
