import * as moment from "moment";
import * as config from "../config";
import * as discord from "discord.js";
import { Message, ClientMessage } from "./type";
import { unwatchFile } from "fs";

export function GetClient() {
    const client = new discord.Client();

    client.on("ready", () => {
        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Client ready ! Setting username...`);
        client.user.setUsername("Town of Spirals");
        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Username set !`);
    });
    client.on("message", (message) => {
        if (!config.ADMIN_ID.some(i => message.author.id === i)) {
            return;
        }
        if (message.channel.type !== "dm") {
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
        if (message.content === "!sadmin channels") {
            message.channel.send(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Known channels :\n${client.channels.map(c => {
                    if (c.type !== "text") return null;
                    const tc = <discord.TextChannel>c;
                    if (!tc.members.some(m => m.id === client.user.id)) return null;
                    return `${tc.guild.name} #${tc.name} {${c.id}}`;
                }).filter(v => !!v).join("\n")}
            `);
            client.user.setStatus("online");
            return;
        }
    });

    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Logging in client...`);
    client.login(config.TOKEN)
        .then(_ => console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Client logged in !`))
        .catch(e => console.error(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Error while logging in : ${e}`) );

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
