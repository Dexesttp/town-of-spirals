import { VOTE_COMMAND, VOTE_NB_COMMAND } from "../commands/constants";

export const startVoteFlavours: ((targets: string[]) => string)[] = [
(targets) => `
And now the villagers have to choose which of them to pacify.
The remaining villagers are : ${targets.map((t, id) => `[${id}] ${t}`).join(", ")}
Use \`${VOTE_COMMAND}\` to vote, or \`${VOTE_NB_COMMAND}\`
`,
];