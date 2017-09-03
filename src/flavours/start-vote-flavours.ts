import { VOTE_COMMAND } from "../commands/constants";

export const startVoteFlavours: ((targets: string[]) => string)[] = [
(targets) => `
And now the villagers have to choose which of them to pacify.
The remaining villagers are : ${targets.join(", ")}
Use \`${VOTE_COMMAND}\` to vote)
`,
];