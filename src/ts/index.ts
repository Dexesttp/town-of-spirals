import * as moment from "moment";
import { GetClient, discordReplier } from "./client/discord";
import { ALLOW_MUMBLE, MUMBLE_SHOULD_EDIT, CAN_DELETE_MESSAGES } from "./config";
import { gameConfig } from "./data/game-config";
import { help } from "./commands/help";
import { rules } from "./commands/rules";
import { mumbleMessage } from "./commands-old/mumble";
/*
import { createGame } from "./commands-old/create-game";
import { join } from "./commands-old/join";
import { cancelCreate } from "./commands-old/cancel-create";
import { leave } from "./commands-old/leave";
import { startGame } from "./commands-old/start-game";
import { setSave, setSkip, setBreak } from "./commands-old/deprogram";
import { handleVote } from "./commands-old/vote";
import { getRole } from "./commands-old/get-role";
import { handleSpy } from "./commands-old/spy";
import { printMessage } from "./commands-old/message";
*/
import { Message } from "discord.js";
import { GetCommandHandler } from "./client/command-handler";

moment.relativeTimeThreshold("ss", 1);
moment.relativeTimeThreshold("s", 60);
moment.relativeTimeThreshold("m", 60);

const client = GetClient();
const command = GetCommandHandler<Message>((message, text) => message.original.channel.send(text));

/** Mumbling */
command.onBefore(async message => {
    if (ALLOW_MUMBLE
        && message.original.channel === gameConfig.channel
        && gameConfig.badoozledPlayers.some(
            m => !gameConfig.recentlyBadoozled.some(b => b !== m) && m.id === message.author,
        )
    ) {
        mumbleMessage(message.original, MUMBLE_SHOULD_EDIT);
        return true;
    }
    return false;
});

/**
 * Help commands
 */
command.on("help", discordReplier(help));
command.on("rules", discordReplier(rules));

/**
 * Game start commands
 */
command.on("create", discordReplier(() => "The bot is under construction for now..."));

/**
 * Debug commands
 */
command.on("clear-chat", async (message, text) => {
    if (!CAN_DELETE_MESSAGES) return false;
    const postedMessages = await message.original.channel.fetchMessages({
        limit: 100,
    });
    let botMessages = postedMessages.map(m => m).filter(m => m.author === client.client.user);
    const qty = +text;
    if (qty) botMessages = botMessages.filter((m, i) => i < qty);
    await Promise.all(botMessages.map(m => m.delete()));
    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Deleted ${botMessages.length} messages`);
    return true;
});
command.on("mumble", async (message, text) => {
    mumbleMessage(message.original, MUMBLE_SHOULD_EDIT);
    return true;
});

client.onMessage(command.messageHandler);
