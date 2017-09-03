"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Commands = require("./constants");
function handleHelp(message) {
    message.channel.send("", {
        embed: {
            title: "Town of spirals - help",
            description: `***COMMANDS***
**=== General ===**
\`${Commands.HELP_COMMAND}\` - Show this screen
\`${Commands.RULES_COMMAND}\` - Show a summary of the game's rules
**=== Create a game ===**
\`${Commands.CREATE_COMMAND}\` - Create a new game
\`${Commands.CANCEL_CREATE_COMMAND}\` - Cancel the game currently created (5min timeout)
\`${Commands.JOIN_COMMAND}\` - Join the game
\`${Commands.LEAVE_COMMAND}\` - Leave the game
\`${Commands.START_COMMAND}\` - Starts the game
**=== In-game commands ===**
\`${Commands.ROLE_COMMAND}\` - Send your current role as PM
\`${Commands.VOTE_COMMAND}\` - Vote for the player (no brackets needed)
\`${Commands.NO_VOTE_COMMAND}\` - Vote to not target anybody
detective-only : \`${Commands.SPY_COMMAND}\`
deprogrammer-only: \`${Commands.SAVE_COMMAND}\` \`${Commands.BREAK_COMMAND}\` \`${Commands.SKIP_COMMAND}\`
		`,
        }
    });
}
exports.handleHelp = handleHelp;
function handleRules(message) {
    message.channel.send("", {
        embed: {
            title: "Town of spirals - rules",
            description: `***RULES***
The town of Spirals was a peaceful community, until a secret team of hypnotists infiltrated them and started brainwashing people.
Each night, the hypnotists can vote to break the mind of one victim.
Each day, the town as a whole votes on someone to mind-break, hoping to catch an hypnotist.
Mind-wiped are out of the game and cannot do anything else.
While the tists know who each other are, no one else knows anyone else - but the same goes for villagers with a hidden talent : this is a game of deception.
The game ends when the whole town is safe from danger, or when nobody in it is left to worry.
**SPECIAL ROLES**
   _Hypnotist_ (at most one for each two villagers)
Each night, the hypnotists vote on a person to break. Be careful, because if the vote ends in a tie nobody will be affected !
	_Deprogrammer_ (4 players or more)
One of the villagers has had extensive training with mind-control and how to undo it. They are able to save one person recently broken by the hypnotists throughout the game. They are also able to break one person at night, but only once.
   _Detective_ (more than two hypnotists)
A villager has an unnatural ability to uncover people's secrets. They weren't always liked before, but now their skills are useful and each night they can figure out what is a specific villager.
	`,
        }
    });
}
exports.handleRules = handleRules;
