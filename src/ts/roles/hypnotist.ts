import { GameContext } from "../game/data/context";
import { GetAlivePlayers } from "../game/utils/alive-players";
import { VoteConfig, VoteResult, VoteResultType } from "../game/vote/types";
import { PlayerInterface } from "../game/data/player";
import { GameTools } from "../game/data/tools";
import { BROKEN_NIGHT } from "../game/data/player-states";

export const HYPNOTIST_ROLE = "hypnotist";

export async function handleHypnotist(
    context: GameContext,
    tools: GameTools,
) {
    const hypnotists = GetAlivePlayers(context).filter(p => p.roles.some(r => r === HYPNOTIST_ROLE));
    const targets = GetAlivePlayers(context).filter(p => !p.attributes.some(a => a === BROKEN_NIGHT));
    const hypnotistInterfaces = hypnotists.map(h => context.playerInterface[h.id]);

    // TODO add flavour
    hypnotistInterfaces.forEach(f => f.sendMessage(`
Breaking time ! Choose one person to target with \`!s vote\`.
The available targets are : ${targets.map((t, i) => `[${i}] ${t.nickname} (${t.username})`)}
    `));

    const voteResult = await tools.startVote({
        voters: hypnotists,
        targets,
        timeout: 300000, // 5mn timeout
        warnTimeout: 30000, // 30s timeout warning
        sendDirectMessage: true,
        // TODO add flavour
        flavour: { },
    });

    if (voteResult.type === VoteResultType.MAJORITY
     || voteResult.type === VoteResultType.UNANIMITY) {
        const targetID = voteResult.target;
        const target = context.players.filter(p => p.id === targetID)[0];
        target.attributes.push(BROKEN_NIGHT);
        // TODO add flavour
        hypnotistInterfaces.forEach(f => f.sendMessage(`You broke ${target.nickname}.`));
        return;
    }

    if (voteResult.type === VoteResultType.TIE
     || voteResult.type === VoteResultType.MAJORITY_NO_VOTE
     || voteResult.type === VoteResultType.UNANIMITY_NO_VOTE) {
        // TODO add flavour
        hypnotistInterfaces.forEach(f => f.sendMessage(`You broke nobody.`));
        return;
    }
}
