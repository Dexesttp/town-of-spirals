import * as moment from "moment";
import * as discord from "discord.js";
import * as config from "../config";
import logger from "../logging";

function formatEmit(message: string) {
    return `[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message}`;
}

export async function runAdmin(client: discord.Client, message: discord.Message) {
    logger.basic(`Running admin command : ${message.content}`);
    if (message.content.startsWith("!sadmin clean ")) {
        const qty = +(message.content.substring("!sadmin clean ".length));
        const messages = await message.channel.fetchMessages({ limit: qty });
        messages.forEach(m => { if (m.deletable) m.delete(); });
        logger.basic(`Deleted ${messages.size} messages`);
        return;
    }
    if (message.content === "!sadmin status get") {
        message.channel.send(formatEmit(`Current presence : ${client.user.presence.status}`));
        return;
    }
    if (message.content === "!sadmin status offline") {
        client.user.setStatus("invisible");
        message.channel.send(formatEmit(`Set status to invisible`));
        return;
    }
    if (message.content === "!sadmin status dnd") {
        client.user.setStatus("dnd");
        message.channel.send(formatEmit(`Set status to DND`));
        return;
    }
    if (message.content === "!sadmin status online") {
        client.user.setStatus("online");
        message.channel.send(formatEmit(`Set status to online`));
        return;
    }
    if (message.content === "!sadmin resetname") {
        client.user.setUsername("Town of Spirals");
        message.channel.send(formatEmit(`Resetting name`));
        return;
    }
    if (message.content === "!sadmin guilds") {
        message.channel.send(formatEmit(`Known guilds :\n${client.guilds.map(g => {
            return `${g.name} {${g.owner.nickname} / ${g.owner.user.username} / ${g.owner.user.tag}}`;
        }).filter(v => !!v).join("\n")}
        `));
        return;
    }
    if (message.content === "!sadmin channels") {
        message.channel.send(formatEmit(`Available channels :\n${client.channels.map(c => {
            if (c.type !== "text") return null;
            const tc = <discord.TextChannel>c;
            if (!tc.members.some(m => m.id === client.user.id)) return null;
            return `${tc.guild.name} #${tc.name} {${c.id}}`;
        }).filter(v => !!v).join("\n")}
        `));
        return;
    }
    if (message.content === "!sadmin channels all") {
        message.channel.send(formatEmit(`All channels :\n${client.channels.map(c => {
            if (c.type !== "text") return null;
            const tc = <discord.TextChannel>c;
            return `${tc.guild.name} #${tc.name} {${c.id}}`;
        }).filter(v => !!v).join("\n")}
        `));
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
    if (message.content === "!sadmin channels all") {
        message.channel.send(formatEmit(`All channels :\n${client.channels.map(c => {
            if (c.type !== "text") return null;
            const tc = <discord.TextChannel>c;
            return `${tc.guild.name} #${tc.name} {${c.id}}`;
        }).filter(v => !!v).join("\n")}
        `));
        return;
    }
    logger.basic(`Unknown command : ${message.content}`);
}
