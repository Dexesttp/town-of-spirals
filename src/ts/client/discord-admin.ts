import * as discord from "discord.js";
import * as moment from "moment";
import * as config from "../config";
import logger from "../logging";

export const ADMIN_COMMAND_PREFIX = "!sadmin";

function formatEmit(message: string) {
  return `[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message}`;
}

export async function runAdmin(
  client: discord.Client,
  message: discord.Message,
) {
  const clientUser = client.user;
  if (!clientUser) return;
  logger.basic(`Running admin command : ${message.content}`);
  if (message.content.startsWith(`${ADMIN_COMMAND_PREFIX} clean `)) {
    const qty = +message.content.substring(
      `${ADMIN_COMMAND_PREFIX} clean `.length,
    );
    if (message.channel.isSendable()) {
      const messages = await message.channel.awaitMessages({ max: qty });
      messages.forEach((m) => {
        if (m.deletable) m.delete();
      });
      logger.basic(`Deleted ${messages.size} messages`);
    }
    return;
  }
  if (message.channel.type !== discord.ChannelType.DM) return;
  if (message.content === `${ADMIN_COMMAND_PREFIX} status get`) {
    message.channel.send(
      formatEmit(`Current presence : ${(clientUser as any).presence.status}`),
    );
    return;
  }
  if (message.content === `${ADMIN_COMMAND_PREFIX} status offline`) {
    clientUser.setStatus("invisible");
    message.channel.send(formatEmit(`Set status to invisible`));
    return;
  }
  if (message.content === `${ADMIN_COMMAND_PREFIX} status dnd`) {
    clientUser.setStatus("dnd");
    message.channel.send(formatEmit(`Set status to DND`));
    return;
  }
  if (message.content === `${ADMIN_COMMAND_PREFIX} status online`) {
    clientUser.setStatus("online");
    message.channel.send(formatEmit(`Set status to online`));
    return;
  }
  if (message.content === `${ADMIN_COMMAND_PREFIX} resetname`) {
    clientUser.setUsername("Town of Spirals");
    message.channel.send(formatEmit(`Resetting name`));
    return;
  }
  if (message.content === `${ADMIN_COMMAND_PREFIX} enable night`) {
    config.setNightTimeDelete(false);
    message.channel.send(formatEmit(`enabled night time talking`));
    logger.basic(`Delete at nighttime : ${config.NIGHT_TIME_DELETE()}`);
    return;
  }
  if (message.content === `${ADMIN_COMMAND_PREFIX} disable night`) {
    config.setNightTimeDelete(true);
    message.channel.send(formatEmit(`disabled night time talking`));
    logger.basic(`Delete at nighttime : ${config.NIGHT_TIME_DELETE()}`);
    return;
  }
  if (message.content === `${ADMIN_COMMAND_PREFIX} enable mumble`) {
    config.setLossTimeDelete(true);
    message.channel.send(formatEmit(`enabled mumble on loss`));
    logger.basic(`Mumble on loss : ${config.LOSS_DELETE()}`);
    return;
  }
  if (message.content === `${ADMIN_COMMAND_PREFIX} disable mumble`) {
    config.setLossTimeDelete(false);
    message.channel.send(formatEmit(`disabled mumble on loss`));
    logger.basic(`Mumble on loss : ${config.LOSS_DELETE()}`);
    return;
  }
  if (message.content === `${ADMIN_COMMAND_PREFIX} listservers`) {
    clientUser.client.guilds.fetch().then((guilds) => {
      let result = "Listing servers:\n";
      for (const [name, g] of guilds) {
        result += `${g.name} => ${g.id}\n`;
      }
      if (message.channel.isSendable()) {
        message.channel.send(formatEmit(result));
      }
      logger.basic(`Listing servers...`);
    });
    return;
  }
  if (message.content.startsWith(`${ADMIN_COMMAND_PREFIX} exitserver `)) {
    const serverId = message.content
      .substring(`${ADMIN_COMMAND_PREFIX} exitserver `.length)
      .trim();
    const server = client.guilds.cache.get(serverId);
    if (!server) {
      message.channel.send(
        formatEmit(`Could not find server to leave: ${serverId}`),
      );
      logger.basic(`Could not find server to leave: ${serverId}`);
      return;
    }
    server.leave();
    message.channel.send(formatEmit(`Left server: ${serverId}`));
    logger.basic(`Left server: ${serverId}`);
    return;
  }
  logger.basic(`Unknown command : ${message.content}`);
}
