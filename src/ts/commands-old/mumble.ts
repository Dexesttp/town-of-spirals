import { Message } from "discord.js";
import { mumbleFlavours } from "../flavour/load-flavours";
import getRandFromArray from "../utils/rand-from-array";

let mumbles: Array<{userID: string, message: Message}> = [];

export async function mumbleMessage(message: Message, mumbleShouldEdit: boolean) {
    if (!mumbleShouldEdit) {
        if (message.deletable) {
            message.delete().catch(e => { console.log("delete failed."); });
        }
        else {
            console.log("Deleting the message is not allowed. Ensure that the bot has permissions in the give channel.");
        }
    }

    (message.guild
        ? message.guild.fetchMember(message.author)
        .then(m => m.displayName)
        : new Promise<string>(res => res(message.author.username))
    ).then(nickname => {
        const name = nickname || message.author.username;
        const flavour = getRandFromArray(mumbleFlavours, 1)[0];
        const toSend = flavour(name, "");
        console.log(toSend);
        if (mumbleShouldEdit) {
            return message.edit(toSend);
        }
        return message.channel.send(toSend);
    })
    .then(m => {
        const userID = message.author.id;
        const previousMumblesFrom = mumbles.filter(mess => mess.userID === userID && mess.message.deletable);
        mumbles.push({ userID, message: m as Message });
        return Promise.all(previousMumblesFrom.map(p => p.message.delete()));
    })
    .catch(e => console.error(`Could not edit message properly : ${JSON.stringify(e)}`));
}
