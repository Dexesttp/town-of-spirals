import { User } from "discord.js";
import { getNickname } from "../data/game-config";

export const enthrallFlavours: ((broken: string, owner: string) => string)[] = [
(broken, owner) => `
${broken} isn't present at the gathering. After searching around for a bit, they find them wandering the surrounding woods with a blank look on their face.
You guide ${broken} back to the safety of the town. Despite all your attempts, you can't find a way to make them focus.
There's no fingerprints in their house, nor any trace of who could have done that. ${owner} decides to bring ${broken} to their home to take care of them.
`,
(broken, owner) => `
${broken} isn't present at the gathering. They're sleeping in their bed, with a strange pair of headphones on their head.
As ${owner} wakes them up and sees their mindless, happy look, you understand that they have been completely broken by the subliminals.
Dusting the headset didn't provide any fingerprints, and there's not even a trace of an intrusion. ${owner} decides to bring ${broken} to their home to take care of them.
`,
(broken, owner) => `
${broken} arrived late at the gathering. Their empty eyes and the trail of drool streaming from their mouth answers the town's question before they even have to ask.
There's nothing special you can see about ${broken} - except from the lack of thoughts. ${owner} decides to bring ${broken} to their home to take care of them.
`,
];
