import { User, Message } from "discord.js";
import { gameConfig, getNickname } from "../data/game-config";
import { handleSpecialRole } from "../data/handle-night";
import { SKIP_COMMAND } from "../constants";

let deprogrammer: User | null = null;
let hasSaved: string[] = [];
let hasBroken: string[] = [];

export function reset() {
    deprogrammer = null;
    hasSaved = [];
    hasBroken = [];
}

export function setDeprogrammer(user: User) {
    deprogrammer = user;
}

export function canSave(user: User) {
    return !hasSaved.some(id => user.id === id);
}

export function canBreak(user: User) {
    return !hasBroken.some(id => user.id === id);
}

export async function setBreak(message: Message, targetName: string) {
    if (message.author !== deprogrammer)
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
    await message.author.send(
        // tslint:disable-next-line:max-line-length
        `You go to ${targetNickname}'s house. While repeating to yourself that it's for the greater good, you use all your knowledge of conditioning to thoroughly break ${targetNickname}'s mind.`,
    );
    await message.author.send(
        // tslint:disable-next-line:max-line-length
        `Leaving ${targetNickname} behind as comfortably as possible, you know that despite everything the hypnotists do you won't be able to do that again.`,
    );
    hasBroken.push(message.author.id);
    gameConfig.badoozledPlayers.push(target);
    gameConfig.recentlyBadoozled.push(target);
    deprogrammer = null;
    handleSpecialRole();
    return;
}

export async function setSave(message: Message) {
    if (message.author !== deprogrammer)
        return;
    if (!canSave(message.author)) {
        message.author.send(`You've lost your un-conditioning gear and can't save any more people.`);
        return;
    }
    const target = gameConfig.recentlyBadoozled[0];
    if (!target) {
        message.author.send(`Nobody has been broken tonight. Use \`${SKIP_COMMAND}\` to skip the night.`);
        return;
    }
    const targetNickname = await getNickname(target);
    await message.author.send(
        // tslint:disable-next-line:max-line-length
        `You go to ${targetNickname}'s house, where they appear to be sleeping peacefully - but you know what really is up. You set up your gear and spent an hour un-conditioning them.`,
    );
    await message.author.send(
        // tslint:disable-next-line:max-line-length
        `Unfortunately, your gear break just as ${targetNickname} shuffles to wake up. You take what you can and leave hurriedly, but you won't be able to un-condition anybody else for a while.`,
    );
    hasSaved.push(message.author.id);
    gameConfig.badoozledPlayers = gameConfig.badoozledPlayers.filter(t => t !== target);
    gameConfig.recentlyBadoozled = gameConfig.recentlyBadoozled.filter(t => t !== target);
    deprogrammer = null;
    handleSpecialRole();
}

export async function setSkip(message: Message) {
    if (message.author !== deprogrammer)
        return;
    await message.author.send(`Convinced that doing nothing for now is the right choice, you go to sleep.`);
    deprogrammer = null;
    handleSpecialRole();
}
