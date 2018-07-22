import * as moment from "moment";
import { GetClient, discordReplier } from "./client/discord";
import { help } from "./commands/help";
import { rules } from "./commands/rules";
import { Message, TextChannel } from "discord.js";
import { GetCommandHandler } from "./client/command-handler";
import { ChannelManager } from "./channel-manager";
import * as config from "./config";

moment.relativeTimeThreshold("ss", 1);
moment.relativeTimeThreshold("s", 60);
moment.relativeTimeThreshold("m", 60);

const client = GetClient();
const command = GetCommandHandler<Message>((message, text) => message.original.channel.send(text));

const channelManager = ChannelManager();

/** Mumbling */
import { mumbleFlavours } from "./flavour/load-flavours";
import getRandom from "./utils/rand-from-array";
command.onBefore(async message => {
    if (channelManager.shouldMumble(message)) {
        const flavour = getRandom(mumbleFlavours, 1)[0];
        const toSend = flavour(message.original.author.username, "");
        client.mumbleMessage(message.original, toSend);
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
        return false;
    }
    if (message.original.channel.type !== "text") {
        message.original.channel.send("Use that in a text channel :)");
        return true;
    }
    channelManager.registerChannel(message.original.channel as TextChannel);
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
command.on("vote", async (message, text) => await channelManager.handleCommand("vote", message, text));
command.on("vote-nb", async (message, text) => await channelManager.handleCommand("vote-nb", message, text));
command.on("no-vote", async (message, text) => await channelManager.handleCommand("no-vote", message, text));
command.on("break", async (message, text) => await channelManager.handleCommand("break", message, text));
command.on("break-nb", async (message, text) => await channelManager.handleCommand("break", message, text));
command.on("save", async (message, text) => await channelManager.handleCommand("save", message, text));
command.on("save-nb", async (message, text) => await channelManager.handleCommand("save", message, text));
command.on("spy", async (message, text) => await channelManager.handleCommand("spy", message, text));
command.on("spy-nb", async (message, text) => await channelManager.handleCommand("spy", message, text));
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
