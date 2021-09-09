import * as discord from "discord.js";
import { PREFIX } from "../client/command-handler";
import logger from "../logging";
import { ManagerContext } from "./types";
import { getChannelData, resetGame } from "./utils";

export function cancelGame(context: ManagerContext) {
  return async (message: discord.Message) => {
    const channel = message.channel;
    if (channel.type !== "GUILD_TEXT") {
      await channel.send("This command is not valid here.");
      return;
    }
    const data = getChannelData(context)(
      message.channel as discord.TextChannel
    );
    if (data === null) return;
    if (data.type === "NOT_STARTED") {
      await channel.send("No game is currently running in this channel.");
      return;
    }
    if (data.type === "RUNNING") {
      await channel.send(
        "Cancelling a running game is currently not possible."
      );
      return;
    }
    resetGame(data);
    logger.channel(
      data.channel.name,
      `Game cancelled by ${message.author.username}.`
    );
    await channel.send(
      `Game cancelled ! Type \`${PREFIX} create\` to create a new game.`
    );
    return;
  };
}
