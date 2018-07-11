import { gameConfig } from "../data/game-config";
import { checkAll } from "../data/check-all";
import { CREATE_COMMAND, START_COMMAND } from "../constants";
import { Message } from "discord.js";

export async function handleVote(message: Message, voteTarget: string | null) {
    if (gameConfig.channel === null) {
        message.channel.send(`There's no game started yet ! Start a game with the \`${CREATE_COMMAND}\` command.`);
        return;
    }
    if (!gameConfig.phase) {
        message.channel.send(`The game is not started ! Start it with the \`${START_COMMAND}\` command.`);
    }
    if (!gameConfig.allPlayers.some(p => p === message.author)) {
        message.channel.send(`You're not playing the game, ${message.author.username}. Sorry.`);
        return;
    }
    if (gameConfig.phase === "night") {
        if (message.guild) {
            if (message.deletable)
                await message.delete();
            gameConfig.channel.send(`Don't vote here at night, but by DM !`);
            return;
        }
        if (gameConfig.badoozledPlayers.some(p => p === message.author)) {
            message.author.send(`Sorry, but you're not able to think at all, let alone cast a vote.`);
            return;
        }
        if (!gameConfig.hypnotists.some(p => p === message.author)) {
            message.author.send(`You're not a hypnotist. You should be asleep at night !`);
            return;
        }
        const saneTists = gameConfig.hypnotists.filter(h => !gameConfig.badoozledPlayers.some(b => b === h));
        if (voteTarget) {
            const targets = gameConfig.allPlayers.filter(p => !gameConfig.badoozledPlayers.some(b => b === p));
            if (!targets.some(p => p.username === voteTarget)) {
                message.author.send(
                    // tslint:disable-next-line:max-line-length
                    `You can't vote for ${voteTarget}, they're not playing or already hypnotized. The available targets are : ${targets.map(t => t.username).join(", ")}`,
                );
                return;
            }
            for (const tist of saneTists)
                tist.send(`${message.author.username} voted for ${voteTarget}.`);
            gameConfig.votes[message.author.id] = voteTarget;
            checkAll();
            return;
        }
        for (const tist of saneTists)
            tist.send(`${message.author.username} voted for to not target anybody.`);
        gameConfig.votes[message.author.id] = voteTarget;
        checkAll();
        return;
    }
    if (gameConfig.phase === "day") {
        if (!message.guild) {
            message.author.send(`By day, all votes are public.`);
            return;
        }
        if (gameConfig.badoozledPlayers.some(p => p === message.author)) {
            gameConfig.channel.send(`Sorry ${message.author.username}, but you're not able to think at all, let alone cast a vote.`);
            return;
        }
        if (voteTarget) {
            const targets = gameConfig.allPlayers.filter(p => !gameConfig.badoozledPlayers.some(b => b === p));
            if (!targets.some(p => p.username === voteTarget)) {
                gameConfig.channel.send(
                    // tslint:disable-next-line:max-line-length
                    `You can't vote for ${voteTarget}, they're not playing or already hypnotized. The available targets are : ${targets.map(t => t.username).join(", ")}`,
                );
                return;
            }
            gameConfig.channel.send(`${message.author.username} voted for ${voteTarget} !`);
            gameConfig.votes[message.author.id] = voteTarget;
            checkAll();
            return;
        }
        gameConfig.channel.send(`${message.author.username} voted to not target anybody !`);
        gameConfig.votes[message.author.id] = voteTarget;
        checkAll();
        return;
    }
}
