import * as discord from "discord.js";
import { Message, TextChannel } from "discord.js";
import * as moment from "moment";
import { ChannelManager } from "./channel-manager";
import {
  getLeaderboard,
  getPlayerStatsFromMessage,
} from "./channel-manager/statistics";
import { GetCommandHandler, PREFIX } from "./client/command-handler";
import { discordReplier, GetClient } from "./client/discord";
import { help } from "./commands/help";
import { rules } from "./commands/rules";
import * as config from "./config";
import { getFlavourList } from "./flavour/get-flavour-list";
import logger from "./logging";
import { updateExcludedInternal } from "./statistics";
import { getStatsFromFile, saveStatsToFile } from "./statistics/file";
import getRandom from "./utils/rand-from-array";

moment.relativeTimeThreshold("ss", 1);
moment.relativeTimeThreshold("s", 60);
moment.relativeTimeThreshold("m", 60);

const client = GetClient((clientInt) => {
  for (const channelID of config.CHANNEL_ID_LIST) {
    const filteredChannels = clientInt.channels.cache.filter((c) => {
      if (c.id !== channelID) return false;
      if (c.type !== discord.ChannelType.GuildText) {
        logger.basic(
          `Could not register channel : ${channelID}. Reason : is not a text channel`,
        );
        return false;
      }
      const tc = <discord.TextChannel>c;
      const clientUser = clientInt.user;
      if (
        clientUser != null &&
        !tc.members.some((m) => m.id === clientUser.id)
      ) {
        logger.basic(
          `Could not register channel : ${channelID}. Reason : bot is not a channel member`,
        );
        return false;
      }
      return true;
    });
    const channel: discord.TextChannel = <any>filteredChannels.first();
    if (!channel) {
      logger.basic(
        `Could not register channel : ${channelID}. Reason : not found or not available`,
      );
      continue;
    }
    channelManager.registerChannel(channel);
    logger.channel(
      channel.name,
      `Registered channel successfully ! (${channelID})`,
    );
  }
});
const command = GetCommandHandler<Message>((message, text) => {
  if (message.original.channel.isSendable()) {
    return message.original.channel.send(text);
  }
});

const channelManager = ChannelManager();

/** Mumbling */
command.onBefore(async (message) => {
  if (config.LOSS_DELETE() && channelManager.shouldMumble(message)) {
    const flavourItem = channelManager.getFlavourFrom(message);
    const flavour = getRandom(flavourItem.mumble, 1)[0];
    const toSend = flavour(message.original.author.username, "");
    client.mumbleMessage(message.original, toSend);
    return true;
  }
  if (config.NIGHT_TIME_DELETE() && channelManager.shouldDelete(message)) {
    client.tryDeleteMessage(message);
    return true;
  }
  return false;
});
command.on("mumble", async (message, text) => {
  const flavourItem = getRandom(getFlavourList(), 1)[0];
  const flavour = getRandom(flavourItem.mumble, 1)[0];
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
  if (!config.ADMIN_ID_LIST.some((i) => message.original.author.id === i)) {
    return true;
  }
  if (message.original.channel.type !== discord.ChannelType.GuildText) {
    if (message.original.channel.isSendable()) {
      message.original.channel.send("Use that in a text channel :)");
    }
    return true;
  }
  const added = channelManager.registerChannel(
    message.original.channel as TextChannel,
  );
  if (added) {
    if (message.original.channel.isSendable()) {
      message.original.channel.send(
        `Channel registered manually for play ! Use \`${PREFIX} create\` to create a game.`,
      );
    }
    return true;
  }
  if (message.original.channel.isSendable()) {
    message.original.channel.send(
      `The channel is already registered. Use \`${PREFIX} create\` to create a game.`,
    );
  }
  return true;
});

/**
 * Game commands
 */
command.on("create", async (message, text) => {
  await channelManager.createGame(message.original);
  return true;
});
command.on("cancel", async (message, text) => {
  await channelManager.cancelGame(message.original);
  return true;
});
command.on("join", async (message, text) => {
  await channelManager.joinGame(message.original);
  return true;
});
command.on("leave", async (message, text) => {
  await channelManager.leaveGame(message.original);
  return true;
});
command.on("start", async (message, text) => {
  await channelManager.startGame(message.original);
  return true;
});
command.on(
  "vote",
  async (message, text) =>
    await channelManager.handleTargetCommandByName("vote", message, text),
);
command.on(
  "vote-nb",
  async (message, text) =>
    await channelManager.handleTargetCommandByIndex("vote", message, text),
);
command.on(
  "no-vote",
  async (message, text) =>
    await channelManager.handleCommand("no-vote", message, text),
);
command.on(
  "break",
  async (message, text) =>
    await channelManager.handleTargetCommandByName("break", message, text),
);
command.on(
  "break-nb",
  async (message, text) =>
    await channelManager.handleTargetCommandByIndex("break", message, text),
);
command.on(
  "save",
  async (message, text) =>
    await channelManager.handleTargetCommandByName("save", message, text),
);
command.on(
  "save-nb",
  async (message, text) =>
    await channelManager.handleTargetCommandByIndex("save", message, text),
);
command.on(
  "spy",
  async (message, text) =>
    await channelManager.handleTargetCommandByName("spy", message, text),
);
command.on(
  "spy-nb",
  async (message, text) =>
    await channelManager.handleTargetCommandByIndex("spy", message, text),
);
command.on(
  "skip",
  async (message, text) =>
    await channelManager.handleCommand("skip", message, text),
);

/**
 * Stats commands
 */
command.on("lb", getLeaderboard);
command.on("leaderboard", getLeaderboard);
command.on("stats", getPlayerStatsFromMessage);
command.on("gdpr", async (message, text) => {
  if (!message.private) {
    if (message.original.channel.isSendable()) {
      message.original.channel.send(
        "The GDPR commands must be used as PMs to the bot.",
      );
    }
    return true;
  }
  if (text === "enable") {
    const data = getStatsFromFile();
    updateExcludedInternal(data, message.author, false);
    saveStatsToFile(data);
    if (message.original.channel.isSendable()) {
      message.original.channel.send(
        "Enabled saving stats successfully. Welcome back !",
      );
    }
    return true;
  }
  if (text === "disable") {
    const data = getStatsFromFile();
    updateExcludedInternal(data, message.author, true);
    saveStatsToFile(data);
    if (message.original.channel.isSendable()) {
      message.original.channel.send("Disabled saving stats successfully.");
    }
    return true;
  }
  if (message.original.channel.isSendable()) {
    message.original.channel.send(
      `Use \`${PREFIX} gdpr enable\` (allow stats) or \`${PREFIX} gdpr disable\` (do not store stats)`,
    );
  }
  return true;
});

client.onMessage(command.messageHandler);
