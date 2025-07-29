import * as discord from "discord.js";
import * as config from "../config";
import logger from "../logging";
import { ADMIN_COMMAND_PREFIX, runAdmin } from "./discord-admin";
import { ClientMessage, Message } from "./type";

export function GetClient(onReadyCB: (client: discord.Client) => void) {
  const client = new discord.Client({
    intents: [
      discord.IntentsBitField.Flags.Guilds,
      discord.IntentsBitField.Flags.GuildMessages,
      discord.IntentsBitField.Flags.GuildMembers,
      discord.IntentsBitField.Flags.DirectMessages,
    ],
    partials: [discord.Partials.Message, discord.Partials.Channel],
  });

  client.on("ready", (client) => {
    logger.basic(`Client ready !`);
    client.user.setStatus("online");
    onReadyCB(client);
  });
  client.on("messageCreate", async (message) => {
    if (!config.ADMIN_ID_LIST.some((i) => message.author.id === i)) return;
    if (!message.content.startsWith(ADMIN_COMMAND_PREFIX)) return;
    await runAdmin(client, message);
  });

  logger.basic(`Starting in client...`);
  client.login(config.TOKEN).catch((e) => {
    logger.basic(`Error while logging in : ${e}`);
    console.error(e);
  });

  let mumbles: Array<{ userID: string; message: discord.Message }> = [];
  return {
    client,
    onMessage(handler: (message: ClientMessage<discord.Message>) => void) {
      client.on("messageCreate", (message) => {
        handler({
          author: message.author.id,
          content: message.content,
          private: message.channel.type === discord.ChannelType.DM,
          original: message,
        });
      });
    },
    async mumbleMessage(message: discord.Message, flavour: string) {
      if (message.channel.type === discord.ChannelType.GuildText) {
        if (message.deletable) {
          await message.delete().catch((e) => {
            /* NO OP */
          });
        } else {
          logger.basic(`Deleting message not possible.`);
          logger.basic(
            `Check perms in '#${(message.channel as discord.TextChannel).name}'`,
          );
        }
      }
      if (!message.channel.isSendable()) return;
      const m = await message.channel.send(flavour);
      const userID = message.author.id;
      const previousMumblesFrom = mumbles.filter(
        (mess) => mess.userID === userID && mess.message.deletable,
      );
      mumbles = mumbles.filter((mess) => mess.userID !== userID);
      mumbles.push({ userID, message: m as discord.Message });
      return Promise.all(
        previousMumblesFrom.map((p) =>
          p.message.delete().catch((e) => {
            /* NO OP */
          }),
        ),
      );
    },
    async tryDeleteMessage(message: Message) {
      const clientMessage = message as ClientMessage<discord.Message>;
      if (clientMessage.original && clientMessage.original.deletable) {
        await clientMessage.original.delete();
        return true;
      }
      return false;
    },
  };
}

export function discordReplier(textGetter: (message: Message) => string) {
  return async (message: ClientMessage<discord.Message>, text: string) => {
    if (message.original.channel.isSendable()) {
      message.original.channel.send(textGetter(message));
    }
    return true;
  };
}
