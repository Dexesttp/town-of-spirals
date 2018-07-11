import { Message } from "discord.js";
import * as Commands from "../constants";

export function handleHelp(message: Message) {
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
    }});
}

// tslint:disable:max-line-length

