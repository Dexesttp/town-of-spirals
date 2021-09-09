import * as discord from "discord.js";
import { ClientMessage } from "../client/type";
import { getFlavourList } from "../flavour/get-flavour-list";
import getRandom from "../utils/rand-from-array";
import { registerChannel } from "./channel-register";
import { unregisterChannel } from "./channel-unregister";
import { shouldDelete, shouldMumble } from "./game-state";
import { cancelGame } from "./lobby-cancel";
import { createGame } from "./lobby-create";
import { joinGame } from "./lobby-join";
import { leaveGame } from "./lobby-leave";
import { startGame } from "./lobby-start";
import { updateStats } from "./statistics";
import { ManagerContext, RunningGameChannelData } from "./types";
import { getUserChannel } from "./utils";

export function ChannelManager() {
  const flavourList = getFlavourList();

  const contextExt: ManagerContext = {
    channelList: [],
  };

  async function handleTargetByNameCommand(
    command: string,
    channel: RunningGameChannelData,
    message: ClientMessage<discord.Message>,
    text: string
  ) {
    let target =
      channel.game.context.players.filter(
        (p) => `@${p.nickname}` === text
      )[0] ||
      channel.game.context.players.filter(
        (p) => `@${p.username}` === text
      )[0] ||
      channel.game.context.players.filter((p) => `<@!${p.id}>` === text)[0] ||
      channel.game.context.players.filter((p) => `<@${p.id}>` === text)[0] ||
      channel.game.context.players.filter((p) => p.nickname === text)[0] ||
      channel.game.context.players.filter((p) => p.username === text)[0] ||
      channel.game.context.players.filter(
        (p) => p.nickname.toUpperCase() === text.toUpperCase()
      )[0] ||
      channel.game.context.players.filter(
        (p) => p.username.toUpperCase() === text.toUpperCase()
      )[0];
    if (!target) {
      message.original.channel.send(
        `Cannot find target player: ${text} in the current game.`
      );
      return true;
    }
    channel.game.handleTargettingCommand(
      command,
      message.author,
      { type: "id", content: target.id },
      message
    );
    return true;
  }

  async function handleTargetByIndexCommand(
    command: string,
    channel: RunningGameChannelData,
    message: ClientMessage<discord.Message>,
    text: string
  ) {
    if (isNaN(+text)) return false;
    channel.game.handleTargettingCommand(
      command,
      message.author,
      { type: "index", content: +text - 1 },
      message
    );
    return true;
  }

  async function handleCommand(
    command: string,
    channel: RunningGameChannelData,
    message: ClientMessage<discord.Message>,
    text: string
  ) {
    channel.game.handleCommand(command, message.author, message);
    return true;
  }

  return {
    registerChannel: registerChannel(contextExt),
    unregisterChannel: unregisterChannel(contextExt),
    createGame: createGame(contextExt),
    joinGame: joinGame(contextExt),
    leaveGame: leaveGame(contextExt),
    startGame: startGame(contextExt, flavourList, updateStats(contextExt)),
    cancelGame: cancelGame(contextExt),
    shouldMumble: shouldMumble(contextExt),
    shouldDelete: shouldDelete(contextExt),
    getFlavourFrom(message: ClientMessage<discord.Message>) {
      const userChannel = getUserChannel(contextExt)(message.author);
      if (!userChannel || userChannel.type !== "RUNNING")
        return getRandom(getFlavourList(), 1)[0];
      return userChannel.flavour;
    },
    async handleTargetCommandByName(
      command: string,
      message: ClientMessage<discord.Message>,
      text: string
    ) {
      const channel = getUserChannel(contextExt)(message.author);
      if (!channel || channel.type !== "RUNNING") return false;
      return await handleTargetByNameCommand(command, channel, message, text);
    },
    async handleTargetCommandByIndex(
      command: string,
      message: ClientMessage<discord.Message>,
      text: string
    ) {
      const channel = getUserChannel(contextExt)(message.author);
      if (!channel || channel.type !== "RUNNING") return false;
      return await handleTargetByIndexCommand(command, channel, message, text);
    },
    async handleCommand(
      command: string,
      message: ClientMessage<discord.Message>,
      text: string
    ) {
      const channel = getUserChannel(contextExt)(message.author);
      if (!channel || channel.type !== "RUNNING") return false;
      return await handleCommand(command, channel, message, text);
    },
  };
}
