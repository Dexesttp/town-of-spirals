import * as discord from "discord.js";
import * as config from "../config";
import logger from "../logging";
import { runAdmin } from "./discord-admin";
import { ClientMessage, Message } from "./type";

export function GetClient(
    onReadyCB: (client: discord.Client) => void,
) {
    const client = new discord.Client();

    client.on("ready", () => {
        logger.basic(`Client ready !`);
        client.user.setStatus("online");
        onReadyCB(client);
    });
    client.on("message", async (message) => {
        if (!config.ADMIN_ID_LIST.some(i => message.author.id === i))
            return;
        if (!message.content.startsWith("!sadmin")) return;
        await runAdmin(client, message);
    });

    logger.basic(`Starting in client...`);
    client.login(config.TOKEN)
        .catch(e => {
            logger.basic(`Error while logging in : ${e}`);
            console.error(e);
        });

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
                    await message.delete().catch(e => { /* NO OP */ });
                }
                else {
                    logger.basic(`Deleting message not possible.`);
                    logger.basic(`Check perms in '#${(message.channel as discord.TextChannel).name}'`);
                }
            }
            const m = await message.channel.send(flavour);
            const userID = message.author.id;
            const previousMumblesFrom = mumbles.filter(mess => mess.userID === userID && mess.message.deletable);
            mumbles = mumbles.filter(mess => mess.userID !== userID);
            mumbles.push({ userID, message: m as discord.Message });
            return Promise.all(previousMumblesFrom.map(p => p.message.delete().catch(e => { /* NO OP */ })));
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
