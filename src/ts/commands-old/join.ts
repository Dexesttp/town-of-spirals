import { gameConfig, getNickname } from "../data/game-config";
import { CREATE_COMMAND } from "../constants";
import { Message } from "discord.js";

export async function join(message: Message) {
    if (gameConfig.channel === null) {
        message.channel.send(`No game started. Start a game first with \`${CREATE_COMMAND}\`.`);
        return;
    }
    if (gameConfig.phase) {
        message.channel.send(`The game is in progress, <@${message.author.id}>. Wait for the next one :D`);
        return;
    }
    const nickname = await getNickname(message.author);
    if (gameConfig.allPlayers.some(p => p === message.author)) {
        gameConfig.channel.send(`You already joined, ${nickname}. ${gameConfig.allPlayers.length} player[s].`);
        return;
    }
    gameConfig.allPlayers.push(message.author);
    gameConfig.channel.send(`${nickname} joined the game (${gameConfig.allPlayers.length} player[s])`);
}
