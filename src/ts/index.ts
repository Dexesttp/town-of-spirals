import * as moment from "moment";
import { GetClient, discordReplier } from "./client/discord";
import { help } from "./commands/help";
import { rules } from "./commands/rules";
import { Message, TextChannel } from "discord.js";
import * as discord from "discord.js";
import { GetCommandHandler } from "./client/command-handler";
import { ChannelManager } from "./channel-manager";
import * as config from "./config";
import logger from "./logging";

moment.relativeTimeThreshold("ss", 1);
moment.relativeTimeThreshold("s", 60);
moment.relativeTimeThreshold("m", 60);

const client = GetClient(clientInt => {
    for (const channelID of config.channelList) {
        const filteredChannels = clientInt.channels.filter(c => {
            if (c.id !== channelID) return false;
            if (c.type !== "text") {
                logger.basic(`Could not register channel : ${channelID}. Reason : is not a text channel`);
                return false;
            }
            const tc = <discord.TextChannel>c;
            if (!tc.members.some(m => m.id === clientInt.user.id)) {
                logger.basic(`Could not register channel : ${channelID}. Reason : bot is not a channel member`);
                return false;
            }
            return true;
        });
        const channel: discord.TextChannel = (<any> (filteredChannels.first()));
        if (!channel) {
            logger.basic(`Could not register channel : ${channelID}. Reason : not found or not available`);
            continue;
        }
        channelManager.registerChannel(channel);
        logger.channel(channel.name, `Registered channel successfully ! (${channelID})`);
    }
});
const command = GetCommandHandler<Message>((message, text) => message.original.channel.send(text));

const channelManager = ChannelManager();

/** Mumbling */
import { mumbleFlavours } from "./flavour/load-flavours";
import getRandom from "./utils/rand-from-array";
const nightTimeDelete = false;
command.onBefore(async message => {
    if (channelManager.shouldMumble(message)) {
        const flavour = getRandom(mumbleFlavours, 1)[0];
        const toSend = flavour(message.original.author.username, "");
        client.mumbleMessage(message.original, toSend);
        return true;
    }
    if (nightTimeDelete && channelManager.shouldDelete(message)) {
        client.tryDeleteMessage(message);
        return true;
    }
    return false;
});
command.on("mumble", async (message, text) => {
    const flavour = getRandom(mumbleFlavours, 1)[0];
    const toSend = flavour(message.original.author.username, "");
    client.mumbleMessage(message.original, toSend);
    return true;
});

/**
 * Help commands
 */
command.on("help", discordReplier(help));
command.on("rules", discordReplier(rules));

/**
 * Channel management commands
 */
command.on("register", async (message, text) => {
    if (!config.ADMIN_ID.some(i => message.original.author.id === i)) {
        return true;
    }
    if (message.original.channel.type !== "text") {
        message.original.channel.send("Use that in a text channel :)");
        return true;
    }
    const added = channelManager.registerChannel(message.original.channel as TextChannel);
    if (added) {
        message.original.channel.send("Channel registered manually for play ! Use `!s create` to create a game.");
        return true;
    }
    message.original.channel.send("The channel is already registered. Use `!s create` to create a game.");
    return true;
});

/**
 * Game commands
 */
command.on("create", async (message, text) => { await channelManager.createGame(message.original); return true; });
command.on("cancel", async (message, text) => { await channelManager.cancelGame(message.original); return true; });
command.on("join", async (message, text) => { await channelManager.joinGame(message.original); return true; });
command.on("leave", async (message, text) => { await channelManager.leaveGame(message.original); return true; });
command.on("start", async (message, text) => { await channelManager.startGame(message.original); return true; });
command.on("vote", async (message, text) => await channelManager.handleTargetCommandByName("vote", message, text));
command.on("vote-nb", async (message, text) => await channelManager.handleTargetCommandByIndex("vote", message, text));
command.on("no-vote", async (message, text) => await channelManager.handleCommand("no-vote", message, text));
command.on("break", async (message, text) => await channelManager.handleTargetCommandByName("break", message, text));
command.on("break-nb", async (message, text) => await channelManager.handleTargetCommandByIndex("break", message, text));
command.on("save", async (message, text) => await channelManager.handleTargetCommandByName("save", message, text));
command.on("save-nb", async (message, text) => await channelManager.handleTargetCommandByIndex("save", message, text));
command.on("spy", async (message, text) => await channelManager.handleTargetCommandByName("spy", message, text));
command.on("spy-nb", async (message, text) => await channelManager.handleTargetCommandByIndex("spy", message, text));
command.on("skip", async (message, text) => await channelManager.handleCommand("skip", message, text));

/**
 * Stats commands
 */
// TODO stats commands
command.on("stats", async (message, text) => {
    message.original.channel.send("This command is not implemented yet. Come back later !");
    return true;
});
command.on("leaderboard", async (message, text) => {
    message.original.channel.send("This command is not implemented yet. Come back later !");
    return true;
});
command.on("gdpr", async (message, text) => {
    message.original.channel.send("These command is not implemented yet. We don't store stats either yet, so no worries !");
    return true;
});

client.onMessage(command.messageHandler);
