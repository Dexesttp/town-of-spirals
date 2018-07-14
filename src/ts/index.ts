import * as moment from "moment";
import { GetClient, discordReplier } from "./client/discord";
import { ALLOW_MUMBLE, MUMBLE_SHOULD_EDIT, CAN_DELETE_MESSAGES } from "./config";
import { help } from "./commands/help";
import { rules } from "./commands/rules";
import { Message } from "discord.js";
import { GetCommandHandler } from "./client/command-handler";
import { ChannelManager } from "./channel-manager";

moment.relativeTimeThreshold("ss", 1);
moment.relativeTimeThreshold("s", 60);
moment.relativeTimeThreshold("m", 60);

const client = GetClient();
const command = GetCommandHandler<Message>((message, text) => message.original.channel.send(text));

const channelManager = ChannelManager();

/** Mumbling */
let shouldMumble = false;
import { mumbleFlavours } from "./flavour/load-flavours";
import getRandom from "./utils/rand-from-array";
command.onBefore(async message => {
    if (shouldMumble) {
        const flavour = getRandom(mumbleFlavours, 1)[0];
        const toSend = flavour(message.original.author.username, "");
        client.mumbleMessage(message.original, toSend);
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
    const flavour = getRandom(mumbleFlavours, 1)[0];
    const toSend = flavour(message.original.author.username, "");
    client.mumbleMessage(message.original, toSend);
    return true;
});

client.onMessage(command.messageHandler);
