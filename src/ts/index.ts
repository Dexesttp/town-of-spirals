import * as moment from "moment";
import { GetClient, discordReplier } from "./client/discord";
import { ALLOW_MUMBLE, MUMBLE_SHOULD_EDIT, CAN_DELETE_MESSAGES } from "./config";
import { gameConfig } from "./data/game-config";
import { help } from "./commands/help";
import { rules } from "./commands/rules";
import { mumbleMessage } from "./commands-old/mumble";
import { createGame } from "./commands-old/create-game";
import { join } from "./commands-old/join";
import { cancelCreate } from "./commands-old/cancel-create";
import { leave } from "./commands-old/leave";
import { startGame } from "./commands-old/start-game";
import { setSave, setSkip, setBreak } from "./commands-old/deprogram";
import { handleVote } from "./commands-old/vote";
import { getRole } from "./commands-old/get-role";
import { handleSpy } from "./commands-old/spy";
import { printMessage } from "./commands-old/message";
import { TextChannel, Message } from "discord.js";
import { GetCommandHandler } from "./client/command-handler";

moment.relativeTimeThreshold("ss", 1);
moment.relativeTimeThreshold("s", 60);
moment.relativeTimeThreshold("m", 60);

const client = GetClient();
const command = GetCommandHandler<Message>((message, text) => message.original.channel.send(text));

/** Mumbling */
command.onBefore(async message => {
    if (ALLOW_MUMBLE
        && message.original.channel === gameConfig.channel
        && gameConfig.badoozledPlayers.some(
            m => !gameConfig.recentlyBadoozled.some(b => b !== m) && m.id === message.author,
        )
    ) {
        mumbleMessage(message.original, MUMBLE_SHOULD_EDIT);
        return true;
    }
    return false;
});

/**
 * Help commands
 */
command.on("help", discordReplier(help));
command.on("rules", discordReplier(rules));

/**
 * Game start commands
 */
command.on("create", async (message, text) => {
    if (createGame(message.original))
        join(message.original);
    return true;
});
command.on("cancel-create", async (message, text) => { cancelCreate(message.original); return true; });
command.on("join", async (message, text) => { join(message.original); return true; });
command.on("leave", async (message, text) => { leave(message.original); return true; });
command.on("start", async (message, text) => { startGame(message.original); return true; });

command.on("role", async (message, text) => { getRole(message.original); return true; });

/**
 * Vote commands
 */
command.on("vote", async (message, text) => {
    const voteIDData = /<@!?(\d+)>/i.exec(text);
    if (voteIDData) {
        let voteTarget = voteIDData[1];
        const member = gameConfig.allPlayers.filter(p => p.id === voteTarget)[0];
        if (!member) {
            message.original.channel.send("Could not find player with that ID.");
            return true;
        }
        handleVote(message.original, member.username);
        return true;
    }
    handleVote(message.original, text.trim());
    return true;
});
command.on("vote-nb", async (message, text) => {
    const alivePeeps = gameConfig.allPlayers.filter(p => !gameConfig.badoozledPlayers.some(b => b === p));
    if (!text) {
        message.original.channel.send(`Available IDs are : ${alivePeeps.map((u, id) => `[${id}] ${u.username}`).join(", ")}`);
        return true;
    }
    const index = +(text.trim());
    const target = alivePeeps[index];
    if (!target) {
        message.original.channel.send(
            `Invalid ID : ${index}. Available players are : ${alivePeeps.map((u, id) => `[${id}] ${u.username}`).join(", ")}`,
        );
        return true;
    }
    handleVote(message.original, target.username);
    return true;
});
command.on("no-vote", async (message, text) => { handleVote(message.original, null); return true; });

/**
 * Special chars commands
 */
command.on("save", async (message, text) => { setSave(message.original); return true; });
command.on("skip", async (message, text) => { setSkip(message.original); return true; });
command.on("break", async (message, text) => { setBreak(message.original, text.trim()); return true; });

command.on("spy", async (message, text) => { handleSpy(message.original, text.trim()); return true; });

/**
 * Debug commands
 */
command.on("clear-chat", async (message, text) => {
    if (!CAN_DELETE_MESSAGES) return false;
    const postedMessages = await message.original.channel.fetchMessages({
        limit: 100,
    });
    let botMessages = postedMessages.map(m => m).filter(m => m.author === client.client.user);
    const qty = +text;
    if (qty) botMessages = botMessages.filter((m, i) => i < qty);
    await Promise.all(botMessages.map(m => m.delete()));
    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Deleted ${botMessages.length} messages`);
    return true;
});
command.on("message", async (message, text) => {
    const splitMessage = /([^\s]+)+ (\d+)/.exec(text);
    if (splitMessage)
        printMessage(message.original, splitMessage[1], +(splitMessage[2]));
    return true;
});
command.on("mumble", async (message, text) => {
    mumbleMessage(message.original, MUMBLE_SHOULD_EDIT);
    return true;
});

client.onMessage(command.messageHandler);
