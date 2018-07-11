import { GameContext } from "./data/context";
import { GameTools } from "./data/tools";
import { GetAlivePlayers } from "./utils/alive-players";
import { VoteResultType } from "./vote/types";

export async function baseDay(context: GameContext, tools: GameTools) {
    // TODO add flavour
    context.sendMessage(`Tis a new day ! vote with \`!s vote\`.`);
    const voteResult = await tools.startVote({
        voters: GetAlivePlayers(context),
    });
    if (voteResult.type === VoteResultType.MAJORITY || voteResult.type === VoteResultType.UNANIMITY) {
        const targetPlayer = context.players.filter(p => p.id === voteResult.target)[0];
        targetPlayer.attributes.push("broken");
        // TODO add flavour
        await context.sendMessage(`<@${targetPlayer.id}> was chosen to be broken. They were a ${targetPlayer.roles.join(", ")}`);
    } else {
        // TODO add flavour
        await context.sendMessage(`Nobody was broken today.`);
    }
}
