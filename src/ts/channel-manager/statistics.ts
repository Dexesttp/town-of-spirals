import * as discord from "discord.js";
import { ClientMessage } from "../client/type";
import { GameResult } from "../game/data/context";
import logger from "../logging";
import {
  getLeaderboardInternal,
  getUserStatsInternal,
  updateStatsInternal,
} from "../statistics";
import { getStatsFromFile, saveStatsToFile } from "../statistics/file";
import { ManagerContext } from "./types";
import { getChannelData } from "./utils";

export function updateStats(context: ManagerContext) {
  return (channel: discord.TextChannel, results: GameResult) => {
    logger.channel(channel.name, `Called stats handling routine`);
    const data = getStatsFromFile();
    const userChannel = getChannelData(context)(channel);
    if (!userChannel || userChannel.type !== "RUNNING") return;
    updateStatsInternal(data, results, userChannel.game.context.players);
    saveStatsToFile(data);
    logger.channel(channel.name, `Stats saved !`);
  };
}

export async function getLeaderboard(
  message: ClientMessage<discord.Message>,
  text: string,
) {
  const stats = getStatsFromFile();
  const data = getLeaderboardInternal(stats);
  if (!data || data.length === 0) {
    if (message.original.channel.isSendable()) {
      message.original.channel.send(`No results in leaderboard for now !`);
    }
    return true;
  }
  // Keep only the first 10 items.
  const toDisplay = data.filter((d, i) => i < 10);
  logger.basic(`Displaying leaderboard`);
  if (message.original.channel.isSendable()) {
    message.original.channel.send(`Leaderboard :
    ${toDisplay.map((d) => `${d.name} - ${d.wins} wins`).join("\n")}`);
  }
  return true;
}

export async function getPlayerStatsFromMessage(
  message: ClientMessage<discord.Message>,
  text: string,
) {
  const stats = getStatsFromFile();
  const data = getUserStatsInternal(stats, text, message.author);
  if (data.type === "noSelfStats") {
    if (message.original.channel.isSendable()) {
      message.original.channel.send(`No stats yet ! Play some games first :)`);
    }
    return true;
  }
  if (data.type === "noStatsFor") {
    if (message.original.channel.isSendable()) {
      message.original.channel.send(
        `Could not find player with ID or name : ${data.name}`,
      );
    }
    return true;
  }
  if (data.type === "result") {
    logger.basic(`Showing stats for ${data.name}`);
    if (message.original.channel.isSendable()) {
      message.original.channel.send(`Stats for ${data.name} :
        Wins : ${data.wins} - Losses : ${data.losses}
        Roles played : ${data.roles
          .map((r) => `${r.role} (${r.count})`)
          .join(", ")}`);
    }
    return true;
  }
  logger.basic(
    `Showing multiple stats for ${data.data.map((d) => d.name).join(", ")}`,
  );
  if (message.original.channel.isSendable()) {
    message.original.channel.send(`Stats matching ${data.data[0].name} :
    ${data.data
      .map(
        (d) =>
          `Wins : ${d.wins} - Losses : ${d.losses} - Roles : ${d.roles
            .map((r) => `${r.role} (${r.count})`)
            .join(", ")}`,
      )
      .join("\n")}`);
  }
  return true;
}
