import { User } from "discord.js";

type FlavourBuilder = (target: User) => string;

export const revealFlavours: {
	hypnotist: FlavourBuilder[],
	villager: FlavourBuilder[],
	detective: FlavourBuilder[],
	deprogrammer: FlavourBuilder[],
} = {
hypnotist: [(target) => `
The villagers check <@${target.id}>'s house out.
They find a detailed summary of each of their likes and dislikes, and some instructions of how to use that against them. Pretty unsettling stuff.
It appears <@${target.id}> was an hypnotist !
`, (target) => `
The villagers check <@${target.id}>'s house out.
They find schematics for a mind-control helmet, and a nearly working prototype.
It appears <@${target.id}> was an hypnotist !
`, (target) => `
The villagers check <@${target.id}>'s house out.
As they enter, the TV screen flickers on and a huge spiral appears on it. As the whole town begins to stare at it, somebody has the common sense to turn the screen off.
It appears <@${target.id}> was an hypnotist !
`, (target) => `
The villagers check <@${target.id}>'s house out.
<@${target.id}> definitely liked pocket watches. He must have at least a hundred of them !
It appears <@${target.id}> was an hypnotist !
`, (target) => `
The villagers check <@${target.id}>'s house out.
There is a big piece of paper on the wall, where everybody can read "I AM A HYPNOTIST. HERE ARE THE NAMES OF THE OTHERS :"
Unfortunately, somebody tore the bottom part of the paper, and the names are missing.
It appears <@${target.id}> was an hypnotist !
`,],
villager: [(target) => `
The villagers check <@${target.id}>'s house out.
They find a dream diary with some pretty interesting fantasies.
It appears <@${target.id}> was just a normal villager.
`, (target) => `
The villagers check <@${target.id}>'s house out.
They find a really good recipe for chocolate cake, and hope <@${target.id}> will still be able to cook.
It appears <@${target.id}> was just a normal villager.
`, (target) => `
The villagers check <@${target.id}>'s house out.
They find a massive dildo and there's no clue if <@${target.id}> was ever able to use it.
It appears <@${target.id}> was just a normal villager.
`, (target) => `
The villagers check <@${target.id}>'s house out.
They cannot find anything out of the ordinary.
It appears <@${target.id}> was just a normal villager.
`, (target) => `
The villagers check <@${target.id}>'s house out.
They cannot find anything out of the ordinary.
It appears <@${target.id}> was just a normal villager.
`, (target) => `
The villagers check <@${target.id}>'s house out.
They cannot find anything out of the ordinary.
It appears <@${target.id}> was just a normal villager.
`, (target) => `
The villagers check <@${target.id}>'s house out.
They cannot find anything out of the ordinary.
It appears <@${target.id}> was just a normal villager.
`, (target) => `
The villagers check <@${target.id}>'s house out.
They cannot find anything out of the ordinary.
It appears <@${target.id}> was just a normal villager.
`],
deprogrammer: [
(target) => `
The villagers check <@${target.id}>'s house out.
They find manuals about self-worth, analysis of hypnosis and some pretty complicated techniques about breaking conditioning.
It appears <@${target.id}> was a deprogrammer.
`],
detective: [(target) => `
The villagers check <@${target.id}>'s house out.
They find a pair of binoculars, some maps and a half-burnt piece of paper with "Potential hypnotists" written on it - no names can be deciphered, sadly.
It appears <@${target.id}> was a detective.
`],
};