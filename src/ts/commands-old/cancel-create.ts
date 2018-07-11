import { gameConfig } from "../data/game-config";
import { clearTimer } from "../data/check-timer";
import { CREATE_COMMAND } from "../constants";
import { Message } from "discord.js";
import { checkDate } from "./create-game";

export function cancelCreate(message: Message) {
    if (!gameConfig.channel) {
        (message.channel || message.author).send(
            `No game running. Type \`${CREATE_COMMAND}\` create a new game.`,
        );
        return;
    }
    if (!checkDate() && gameConfig.gameStarter !== message.author) {
        (message.channel || message.author).send(
            `The game has been created less than 5 minutes ago (or has been running for less than 30minutes), and you can't cancel it yet.`,
        );
        return;
    }
    gameConfig.channel.send(`Game cancelled. Type \`${CREATE_COMMAND}\` create a new game.`);
    gameConfig.channel = null;
    gameConfig.gameStarter = null;
    gameConfig.allPlayers = [];
    gameConfig.badoozledPlayers = [];
    gameConfig.recentlyBadoozled = [];
    gameConfig.hypnotists = [];
    gameConfig.specials = {};
    clearTimer();
}
