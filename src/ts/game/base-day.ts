import { GameContext } from "./data/context";
import { GameTools } from "./data/tools";
import { GetAlivePlayers } from "./utils/alive-players";
import { VoteResultType } from "./vote/types";
import { BROKEN } from "./data/player-states";

export async function baseDay(context: GameContext, tools: GameTools) {
    // TODO add flavour
    context.sendMessage(`Tis a new day ! vote with \`!s vote\`.`);
    const voteResult = await tools.startVote({
        voters: GetAlivePlayers(context),
        // TODO add flavour
        flavour: { },
    });
    if (voteResult.type === VoteResultType.MAJORITY || voteResult.type === VoteResultType.UNANIMITY) {
        const targetPlayer = context.players.filter(p => p.id === voteResult.target)[0];
        targetPlayer.attributes.push(BROKEN);
        // TODO add flavour
        await context.sendMessage(`<@${targetPlayer.id}> was chosen to be broken. They were a ${targetPlayer.roles.join(", ")}`);
    } else {
        // TODO add flavour
        await context.sendMessage(`Nobody was broken today.`);
    }
}
