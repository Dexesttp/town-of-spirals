"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../commands/constants");
exports.startVoteFlavours = [
    (targets) => `
And now the villagers have to choose which of them to pacify.
The remaining villagers are : ${targets.join(", ")}
Use \`${constants_1.VOTE_COMMAND}\` to vote)
`,
];
