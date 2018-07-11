import * as moment from "moment";
import * as config from "../config";
import * as discord from "discord.js";
import { GetCommandHandler } from "./command-handler";
import { Message, ClientMessage } from "./type";

export function GetClient() {
    const client = new discord.Client();

    client.on("ready", () => {
        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Setting client data...`);
        client.user.setUsername("Town of Spirals")
        .then(c => client.user.setStatus("online"))
        .then(c => console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Client ready !`))
        .catch(e => {
            console.error(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Error while setting client data`);
            console.error(e);
        });
    });

    client.login(config.TOKEN)
    .then((str) => {
        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Client started.`);
    })
    .catch((e) => {
        console.error(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Error while starting client.`);
        console.error(e);
    });

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
