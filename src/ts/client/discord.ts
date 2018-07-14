import * as moment from "moment";
import * as config from "../config";
import * as discord from "discord.js";
import { Message, ClientMessage } from "./type";
import { unwatchFile } from "fs";

export function GetClient() {
    const client = new discord.Client();

    client.on("ready", () => {
        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Client ready !`);
        client.user.setStatus("online");
    });
    client.on("message", async (message) => {
        if (!config.ADMIN_ID.some(i => message.author.id === i)) {
            return;
        }
        if (message.channel.type !== "dm") {
            return;
        }
        if (!message.content.startsWith("!sadmin")) {
            return;
        }
        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Running admin command : ${message.content}`);
        if (message.content.startsWith("!sadmin clean ")) {
            const qty = +(message.content.substring("!sadmin clean ".length));
            const messages = await message.channel.fetchMessages({ limit: qty });
            messages.forEach(m => { if (m.deletable) m.delete(); });
            console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Deleted ${messages.size} messages`);
            return;
        }
        if (message.content === "!sadmin status get") {
            message.channel.send(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Current presence : ${client.user.presence.status}`);
            return;
        }
        if (message.content === "!sadmin status offline") {
            client.user.setStatus("invisible");
            message.channel.send(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Set status to invisible`);
            return;
        }
        if (message.content === "!sadmin status dnd") {
            client.user.setStatus("dnd");
            message.channel.send(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Set status to DND`);
            return;
        }
        if (message.content === "!sadmin status online") {
            client.user.setStatus("online");
            message.channel.send(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Set status to online`);
            return;
        }
        if (message.content === "!sadmin resetname") {
            client.user.setUsername("Town of Spirals");
            message.channel.send(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Resetting name`);
            return;
        }
        if (message.content === "!sadmin guilds") {
            message.channel.send(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Known guilds :\n${client.guilds.map(g => {
                    return `${g.name} {${g.owner.nickname} / ${g.owner.user.username} / ${g.owner.user.tag}}`;
                }).filter(v => !!v).join("\n")}
            `);
            client.user.setStatus("online");
            return;
        }
        if (message.content === "!sadmin channels") {
            message.channel.send(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Available channels :\n${client.channels.map(c => {
                if (c.type !== "text") return null;
                const tc = <discord.TextChannel>c;
                if (!tc.members.some(m => m.id === client.user.id)) return null;
                return `${tc.guild.name} #${tc.name} {${c.id}}`;
            }).filter(v => !!v).join("\n")}
            `);
            client.user.setStatus("online");
            return;
        }
        if (message.content === "!sadmin channels all") {
            message.channel.send(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] All channels :\n${client.channels.map(c => {
                if (c.type !== "text") return null;
                const tc = <discord.TextChannel>c;
                return `${tc.guild.name} #${tc.name} {${c.id}}`;
            }).filter(v => !!v).join("\n")}
            `);
            client.user.setStatus("online");
            return;
        }
        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Unknown command.`);
    });

    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Logging in client...`);
    client.login(config.TOKEN)
        .then(_ => console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Client logged in !`))
        .catch(e => console.error(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Error while logging in : ${e}`) );

    let mumbles: Array<{ userID: string, message: discord.Message }> = [];
    return {
        client,
        onMessage(handler: (message: ClientMessage<discord.Message>) => void) {
            client.on("message", (message) => {
                handler({
                    author: message.author.id,
                    content: message.content,
                    private: message.channel.type === "dm",
                    original: message,
                });
            });
        },
        async mumbleMessage(message: discord.Message, flavour: string) {
            if (message.channel.type === "text") {
                if (message.deletable) {
                    await message.delete()
                        .catch(e => { console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Delete failed.`); });
                }
                else {
                    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Deleting message not possible.`);
                    console.log(
                        `[${moment().format("YYYY-MM-DD HH:mm:ss")}]Check perms in '#${(message.channel as discord.TextChannel).name}'`,
                    );
                }
            }
            const m = await message.channel.send(flavour);
            const userID = message.author.id;
            const previousMumblesFrom = mumbles.filter(mess => mess.userID === userID && mess.message.deletable);
            mumbles.push({ userID, message: m as discord.Message });
            return Promise.all(previousMumblesFrom.map(p => p.message.delete()));
        },
        async tryDeleteMessage(message: Message, timeout?: number) {
            const clientMessage = message as ClientMessage<discord.Message>;
            if (clientMessage.original && clientMessage.original.deletable) {
                await clientMessage.original.delete(timeout);
                return true;
            }
            return false;
        },
    };
}

export function discordReplier(textGetter: ((message: Message) => string)) {
    return async (message: ClientMessage<discord.Message>, text: string) => {
        message.original.channel.send(textGetter(message));
        return true;
    };
}
