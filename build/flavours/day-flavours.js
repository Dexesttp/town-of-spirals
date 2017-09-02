"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../commands/constants");
const rand_from_array_1 = require("../utils/rand-from-array");
function newDayFlavour(channel) {
    channel.send(`The sun is rising on the town of spirals.`);
}
exports.newDayFlavour = newDayFlavour;
exports.enthrallFlavours = [
    (channel, broken, owner) => {
        channel.send(`
<@${broken.id}> isn't present at the gathering. After searching around for a bit, they find them wandering the surrounding woods with a blank look on their face.
You guide <@${broken.id}> back to the safety of the town. Despite all your attempts, you can't find a way to make them focus.
There's no fingerprints in their house, nor any trace of who could have done that. <@${owner.id}> decides to bring <@${broken.id}> to their home to take care of them.
		`);
    },
    (channel, broken, owner) => {
        channel.send(`
<@${broken.id}> isn't present at the gathering. They're sleeping in their bed, with a strange pair of headphones on their head.
As <@${owner.id}> wake them up and see their mindless, happy look, you understand that they have been completely broken by the subliminals.
Dusting the headset didn't provide any fingerprints, and there's not even a trace of an intrusion. <@${owner.id}> decides to bring <@${broken.id}> to their home to take care of them.
		`);
    }
];
function getRandomEnthrall() {
    const flavour = rand_from_array_1.default(exports.enthrallFlavours, 1)[0];
    return flavour;
}
exports.getRandomEnthrall = getRandomEnthrall;
function enthrallingResults(channel, remainingPlayers, brokenPlayers) {
    if (brokenPlayers.length) {
        channel.send(`The villagers all gather in the center of the village. Something is wrong.`);
        for (let broken of brokenPlayers) {
            const owner = rand_from_array_1.default(remainingPlayers, 1)[0];
            getRandomEnthrall()(channel, broken, owner);
        }
    }
    else {
        channel.send(`Surprisingly, nobody got enthralled tonight. Maybe the remaining hypnotists were too busy arguing between them.`);
    }
    channel.send(`Some more villagers have been enthralled tonight : ${brokenPlayers.map(p => `<@${p.id}>`).join(" , ")}`);
}
exports.enthrallingResults = enthrallingResults;
function startVoteFlavour(channel) {
    channel.send(`And now the villagers have to choose which of them to... pacify. (use \`${constants_1.VOTE_COMMAND}\` to vote)`);
}
exports.startVoteFlavour = startVoteFlavour;
