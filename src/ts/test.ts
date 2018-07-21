import { LoadVoteFlavour, LoadYamlFile, LoadToggledData } from "./flavour/load-flavours";

const tistFile = LoadYamlFile("strings/hypnotist.yaml");
const townFile = LoadYamlFile("strings/town.yaml");

console.log("Test : hypnotist vote");
const tistVoteFlav = LoadVoteFlavour(tistFile.vote);
console.log(tistVoteFlav.onVote ? tistVoteFlav.onVote(
    { id: "idTst1", nickname: "Test 1", roles: [], attributes: [], username: "tst1" },
    { id: "idTst2", nickname: "Test 2", roles: [], attributes: [], username: "tst2" },
) : "Not found");

console.log("Test : town vote");
const townVoteFlav = LoadVoteFlavour(townFile.vote);
console.log(townVoteFlav.onVote ? townVoteFlav.onVote(
    { id: "idTst1", nickname: "Test 1", roles: [], attributes: [], username: "tst1" },
    { id: "idTst2", nickname: "Test 2", roles: [], attributes: [], username: "tst2" },
) : "Not found");

const tistBreakFlav = LoadToggledData(tistFile.action.break.self,
(data: string[] | { player: string[], target: string[] }, test: string) => {
    if (Array.isArray(data)) {
        return data[0];
    }
    if (test === "target")
        return data.target[0];
    return data.player[0];
});
console.log("Test : tist self break");
console.log(tistBreakFlav ? tistBreakFlav(1)("") : "Not found");
console.log("Test : tist duo broken");
console.log(tistBreakFlav ? tistBreakFlav(2)("target") : "Not found");
console.log("Test : tist duo breaking");
console.log(tistBreakFlav ? tistBreakFlav(2)("player") : "Not found");
console.log("Test : tist trio broken");
console.log(tistBreakFlav ? tistBreakFlav(3)("target") : "Not found");
console.log("Test : tist trio breaking");
console.log(tistBreakFlav ? tistBreakFlav(3)("player") : "Not found");
