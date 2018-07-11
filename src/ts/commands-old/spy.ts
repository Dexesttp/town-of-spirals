import { Message, User } from "discord.js";
import { gameConfig, getNickname } from "../data/game-config";
import { handleSpecialRole } from "../data/handle-night";

let detective: User | null = null;

export function setDetective(user: User) {
    detective = user;
}

export async function handleSpy(message: Message, targetName: string) {
    if (message.author !== detective)
        return;
    const alivePlayers = gameConfig.allPlayers.filter(p => !gameConfig.badoozledPlayers.some(b => p === b));
    let target = alivePlayers.filter(p => p.username === targetName)[0];
    if (!target) {
        target = alivePlayers.filter(p => p.username.toLowerCase() === targetName.toLowerCase())[0];
        if (!target) {
            message.author.send(`${targetName} is not a valid name. Valid targets are ${alivePlayers.map(p => p.username).join(", ")}`);
            return;
        }
    }
    const targetNickname = await getNickname(target);
    await message.author.send(`You snoop up around ${targetName}'s house.`);
    if (gameConfig.hypnotists.some(h => h === target)) {
        await message.author.send(
            // tslint:disable-next-line:max-line-length
            `They're not in, and you can see them coming back after a while - carrying out a weird device. You're pretty sure ${targetName} is a hypnotist.`
        );
    }
    else if (gameConfig.specials[target.id] === "detective") {
        await message.author.send(
            `They're not in, and you can see them snooping around another house. Could ${targetName} be a fellow detective ?`
        );
    }
    else if (gameConfig.specials[target.id] === "deprogrammer") {
        await message.author.send(
            // tslint:disable-next-line:max-line-length
            `The lights in their home are still on. ${targetName} is working on a special device, and you find notes in their bin about "breaking conditioning". You're pretty sure they're a deprogrammer.`
        );
    } else {
        await message.author.send(`${targetName} is at home, sleeping. Either they're very tired or they're just a normal citizen.`);
    }
    detective = null;
    handleSpecialRole();
}
