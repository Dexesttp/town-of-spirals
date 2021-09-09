import * as discord from "discord.js";
import * as moment from "moment";
import * as config from "../config";
import logger from "../logging";

function formatEmit(message: string) {
  return `[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message}`;
}

export async function runAdmin(
  client: discord.Client,
  message: discord.Message
) {
  const clientUser = client.user;
  if (!clientUser) return;
  logger.basic(`Running admin command : ${message.content}`);
  if (message.content.startsWith("!sadmin clean ")) {
    const qty = +message.content.substring("!sadmin clean ".length);
    const messages = await message.channel.awaitMessages({ max: qty });
    messages.forEach((m) => {
      if (m.deletable) m.delete();
    });
    logger.basic(`Deleted ${messages.size} messages`);
    return;
  }
  if (message.channel.type !== "DM") return;
  if (message.content === "!sadmin status get") {
    message.channel.send(
      formatEmit(`Current presence : ${(clientUser as any).presence.status}`)
    );
    return;
  }
  if (message.content === "!sadmin status offline") {
    clientUser.setStatus("invisible");
    message.channel.send(formatEmit(`Set status to invisible`));
    return;
  }
  if (message.content === "!sadmin status dnd") {
    clientUser.setStatus("dnd");
    message.channel.send(formatEmit(`Set status to DND`));
    return;
  }
  if (message.content === "!sadmin status online") {
    clientUser.setStatus("online");
    message.channel.send(formatEmit(`Set status to online`));
    return;
  }
  if (message.content === "!sadmin resetname") {
    clientUser.setUsername("Town of Spirals");
    message.channel.send(formatEmit(`Resetting name`));
    return;
  }
  if (message.content === "!sadmin enable night") {
    config.setNightTimeDelete(false);
    message.channel.send(formatEmit(`enabled night time talking`));
    logger.basic(`Delete at nighttime : ${config.NIGHT_TIME_DELETE()}`);
    return;
  }
  if (message.content === "!sadmin disable night") {
    config.setNightTimeDelete(true);
    message.channel.send(formatEmit(`disabled night time talking`));
    logger.basic(`Delete at nighttime : ${config.NIGHT_TIME_DELETE()}`);
    return;
  }
  if (message.content === "!sadmin enable mumble") {
    config.setLossTimeDelete(true);
    message.channel.send(formatEmit(`enabled mumble on loss`));
    logger.basic(`Mumble on loss : ${config.LOSS_DELETE()}`);
    return;
  }
  if (message.content === "!sadmin disable mumble") {
    config.setLossTimeDelete(false);
    message.channel.send(formatEmit(`disabled mumble on loss`));
    logger.basic(`Mumble on loss : ${config.LOSS_DELETE()}`);
    return;
  }
  logger.basic(`Unknown command : ${message.content}`);
}
