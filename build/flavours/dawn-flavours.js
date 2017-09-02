"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../commands/constants");
exports.newDayFlavours = [
    (channel) => channel.send(`The sun is rising on the town of spirals.`),
];
exports.noEnthrallFlavours = [
    (channel) => channel.send(`
Surprisingly, nobody got enthralled tonight. Maybe the remaining hypnotists were too busy arguing between them.
The villagers gather around in the center of the village. A single night of respite doesn't mean there's no danger.
	`),
];
exports.enthrallFlavours = [
    (channel, broken, owner) => channel.send(`
<@${broken.id}> isn't present at the gathering. After searching around for a bit, they find them wandering the surrounding woods with a blank look on their face.
You guide <@${broken.id}> back to the safety of the town. Despite all your attempts, you can't find a way to make them focus.
There's no fingerprints in their house, nor any trace of who could have done that. <@${owner.id}> decides to bring <@${broken.id}> to their home to take care of them.
	`),
    (channel, broken, owner) => channel.send(`
<@${broken.id}> isn't present at the gathering. They're sleeping in their bed, with a strange pair of headphones on their head.
As <@${owner.id}> wake them up and see their mindless, happy look, you understand that they have been completely broken by the subliminals.
Dusting the headset didn't provide any fingerprints, and there's not even a trace of an intrusion. <@${owner.id}> decides to bring <@${broken.id}> to their home to take care of them.
	`),
];
exports.startVoteFlavours = [
    (channel) => channel.send(`
And now the villagers have to choose which of them to pacify.
Use \`${constants_1.VOTE_COMMAND}\` to vote)
	`),
];