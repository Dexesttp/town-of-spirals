import { LoadVoteFlavour, LoadYamlFile, LoadToggledData } from "./flavour/load-flavours";
import { getFlavourFromFolder } from "./flavour/get-flavour-list";

const flavours = getFlavourFromFolder("strings/classic/");

console.log("Test : hypnotist vote");
const tistVoteFlav = flavours.handleHypnotist.vote || {};
console.log(tistVoteFlav.onVote ? tistVoteFlav.onVote(
    { id: "idTst1", nickname: "Test 1", roles: [], attributes: [], username: "tst1" },
    { id: "idTst2", nickname: "Test 2", roles: [], attributes: [], username: "tst2" },
) : "Not found");

console.log("Test : town vote");
const townVoteFlav = flavours.baseDay.vote || {};
console.log(townVoteFlav.onVote ? townVoteFlav.onVote(
    { id: "idTst1", nickname: "Test 1", roles: [], attributes: [], username: "tst1" },
    { id: "idTst2", nickname: "Test 2", roles: [], attributes: [], username: "tst2" },
) : "Not found");

const tistBreakFlav = flavours.handleHypnotist.breakTist;
const tistBrokenFlav = flavours.handleHypnotist.brokenTist;
console.log("Test : tist self break");
console.log(tistBreakFlav ? tistBreakFlav(1)(
        { id: "idTst1", nickname: "Test 1", roles: [], attributes: [], username: "tst1" },
        { id: "idTst2", nickname: "Test 2", roles: [], attributes: [], username: "tst2" },
        2,
    ) : "Not found");
console.log("Test : tist duo broken");
console.log(tistBrokenFlav ? tistBrokenFlav(2)(
        { id: "idTst1", nickname: "Test 1", roles: [], attributes: [], username: "tst1" },
        { id: "idTst2", nickname: "Test 2", roles: [], attributes: [], username: "tst2" },
        2,
    ) : "Not found");
console.log("Test : tist duo breaking");
console.log(tistBreakFlav ? tistBreakFlav(2)(
        { id: "idTst1", nickname: "Test 1", roles: [], attributes: [], username: "tst1" },
        { id: "idTst2", nickname: "Test 2", roles: [], attributes: [], username: "tst2" },
        2,
    ) : "Not found");
console.log("Test : tist trio broken");
console.log(tistBrokenFlav ? tistBrokenFlav(3)(
        { id: "idTst1", nickname: "Test 1", roles: [], attributes: [], username: "tst1" },
        { id: "idTst2", nickname: "Test 2", roles: [], attributes: [], username: "tst2" },
        2,
    ) : "Not found");
console.log("Test : tist trio breaking");
console.log(tistBreakFlav ? tistBreakFlav(3)(
        { id: "idTst1", nickname: "Test 1", roles: [], attributes: [], username: "tst1" },
        { id: "idTst2", nickname: "Test 2", roles: [], attributes: [], username: "tst2" },
        2,
    ) : "Not found");

console.log("Test victory");
const { hypnotists, town } = flavours.checkEnd;
console.log(hypnotists ? hypnotists(1)([], [], []) : "Not found");
console.log(hypnotists ? hypnotists(2)([], [], []) : "Not found");
console.log(town ? town(1)([], [], []) : "Not found");
console.log(town ? town(2)([], [], []) : "Not found");
