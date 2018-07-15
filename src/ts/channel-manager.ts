import * as moment from "moment";
import * as discord from "discord.js";
import { GameData, Game } from "./game";
import { DiscordGameCreator, GameCreator } from "./game-creator/discord";
import { GiveRolesTo } from "./game-creator/give-roles-to";
import { handleHypnotist } from "./roles/hypnotist";
import { handleDeprogrammer } from "./roles/deprogrammer";
import { handleDetective } from "./roles/detective";
import { ClientMessage } from "./client/type";
import { BROKEN } from "./game/data/player-states";
import { unwatchFile } from "fs";

type NotStartedGameChannelData = { type: "NOT_STARTED", channel: discord.TextChannel };
type CreatingGameChannelData = { type: "CREATING", channel: discord.TextChannel, creator: DiscordGameCreator, createdDate: moment.Moment };
type RunningGameChannelData = { type: "RUNNING", channel: discord.TextChannel, game: GameData, createdDate: moment.Moment };

export type RegisteredGameChannelData =
NotStartedGameChannelData
| CreatingGameChannelData
| RunningGameChannelData;

export function ChannelManager(
    timeBeforeCancelInMinutes = 5,
) {
    const MIN_PLAYERS = 4;
    let channelList: RegisteredGameChannelData[] = [];

    function getChannelData(channel: discord.TextChannel): RegisteredGameChannelData | null {
        const data = channelList.filter(c => c.channel.id === channel.id);
        if (data.length === 0) {
            return null;
        }
        return data[0];
    }

    function getUserChannel(userId: string): RegisteredGameChannelData | null {
        const data = channelList.filter(c => {
            if (c.type === "CREATING")
                return c.creator.players().some(p => p.id === userId);
            if (c.type === "RUNNING")
                return c.game.context.players.some(p => p.id === userId);
            return false;
        });
        if (data.length === 0) {
            return null;
        }
        return data[0];
    }

    async function createGame(message: discord.Message) {
        const channel = message.channel;
        if (channel.type !== "text") {
            await channel.send("You cannot create a game here. Go to a server channel where the bot is enabled.");
            return;
        }
        const data = getChannelData(message.channel as discord.TextChannel);
        if (data === null) {
            await channel.send("The ToS bot is not enabled for this channel.");
            return;
        }
        if (data.type === "CREATING") {
            await channel.send("There is already a game being created in this channel. Type `!s join` to join it !");
            return;
        }
        if (data.type === "RUNNING") {
            await channel.send("A game is currently in progress. You cannot create a game while another is running.");
            return;
        }
        const newData = <CreatingGameChannelData><RegisteredGameChannelData>data;
        newData.type = "CREATING";
        newData.creator = GameCreator();
        newData.createdDate = moment();
        const player = await newData.creator.addPlayer(message);
        if (!player) {
            console.log(`There was an error (unk 103)`);
            return;
        }
        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message.author.username} created a game in ${newData.channel.name}`);
        channel.send(`A new game has been created by ${player.nickname} ! You need at least ${MIN_PLAYERS} people to start it.`);
        channel.send("Type `!s join` to join the game and `!s start` to start !");
    }

    async function cancelGame(message: discord.Message) {
        const channel = message.channel;
        if (channel.type !== "text") {
            await channel.send("This command is not valid here.");
            return;
        }
        const data = getChannelData(message.channel as discord.TextChannel);
        if (data === null) {
            await channel.send("The ToS bot is not enabled for this channel.");
            return;
        }
        if (data.type === "NOT_STARTED") {
            await channel.send("No game is currently running in this channel.");
            return;
        }
        if (data.type === "RUNNING") {
            await channel.send("Cancelling a running game is currently not possible.");
            return;
        }
        if (data.createdDate.add(timeBeforeCancelInMinutes, "minutes") < moment()) {
            await channel.send("The game has been created less than 5 minutes ago, and you can't cancel it yet.");
            return;
        }
        const newData = <NotStartedGameChannelData><RegisteredGameChannelData>data;
        delete data.createdDate;
        delete data.creator;
        newData.type = "NOT_STARTED";
        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message.author.username} cancelled a game in ${data.channel.name}`);
        await channel.send("Game cancelled !");
        return;
    }

    async function joinGame(message: discord.Message) {
        const channel = message.channel;
        if (channel.type !== "text") {
            await channel.send("You cannot join a game here. Go to a server channel where the bot is enabled.");
            return;
        }
        const data = getChannelData(message.channel as discord.TextChannel);
        if (data === null) {
            await channel.send("The ToS bot is not enabled for this channel.");
            return;
        }
        const userData = getUserChannel(message.author.id);
        if (userData) {
            const playerList = (userData.type === "CREATING"
                ? userData.creator.players()
                : userData.type === "RUNNING"
                ? userData.game.context.players
                : []);
            const playerData = playerList.filter(p => p.id === message.author.id)[0];
            if (data !== userData) {
                await channel.send(`You already joined another game, ${playerData.nickname}.`);
                return;
            }
            await channel.send(`You already joined the game, ${playerData.nickname}.`);
            return;
        }
        if (data.type === "NOT_STARTED") {
            await channel.send("No game is currently running in this channel.");
            return;
        }
        if (data.type === "RUNNING") {
            await channel.send("A game is currently in progress. Wait for the next one to join !");
            return;
        }
        const player = await data.creator.addPlayer(message);
        if (!player) {
            await channel.send(`There was an error and we couldn't add you to the game.`);
            return;
        }
        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message.author.username} joined a game in ${data.channel.name}`);
        await channel.send(`${player.nickname} has joined the game. ${data.creator.players().length} player(s) waiting for start !`);
    }

    async function leaveGame(message: discord.Message) {
        const data = getUserChannel(message.author.id);
        if (data === null || data.type === "NOT_STARTED") {
            await message.channel.send("You are not currently in any game. No need to leave.");
            return;
        }
        if (data.type === "RUNNING") {
            await message.channel.send("You cannot leave a running game. Sorry !");
            return;
        }
        const player = data.creator.players().filter(p => p.id === message.author.id)[0];
        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message.author.username} left a game in ${data.channel.name}`);
        await data.channel.send(`${player.nickname} has left the game. ${data.creator.players().length} player(s) waiting for start !`);
    }

    async function startGame(message: discord.Message) {
        const userData = getUserChannel(message.author.id);
        if (userData === null || userData.type === "NOT_STARTED") {
            await message.channel.send("You are not currently in any game, and therefore cannot start it.");
            return;
        }
        if (userData.type === "RUNNING") {
            await message.channel.send("The game is already running !");
            return;
        }
        const creator = userData.creator;
        const players = creator.players();
        if (players.length < MIN_PLAYERS) {
            await message.channel.send(
                `There's currently less than ${MIN_PLAYERS} players in the game. Bring some more friends to play !`,
            );
            return;
        }
        const channel = userData.channel;
        delete userData.creator;
        const newData = <RunningGameChannelData><RegisteredGameChannelData>userData;
        newData.type = "RUNNING";
        GiveRolesTo(players);
        newData.game = Game(
            players,
            async (m) => { await channel.send(m); },
            creator.playerInterface(),
            async (m) => {
                const original = (m as ClientMessage<discord.Message>).original;
                if (!original.deletable) return false;
                await original.delete();
                return true;
            },
        );
        newData.game.subscribeNightRole(handleHypnotist);
        newData.game.subscribeNightRole(handleDeprogrammer);
        newData.game.subscribeNightRole(handleDetective);
        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message.author.username} started a game in ${channel.name}`);
        newData.game.start();
    }

    async function handleTargetByNameCommand(
        command: string,
        channel: RunningGameChannelData,
        message: ClientMessage<discord.Message>,
        text: string,
    ) {
        let target = channel.game.context.players.filter(p => p.nickname === text)[0]
            || channel.game.context.players.filter(p => p.username === text)[0]
            || channel.game.context.players.filter(p => `<@${p.id}>` === text)[0];
        if (!target) {
            message.original.channel.send(`Cannot find target player: ${text}`);
            return false;
        }
        channel.game.handleTargettingCommand(command, message.author, { type: "id", content: target.id }, message);
        return true;
    }
    async function handleTargetByIndexCommand(
        command: string,
        channel: RunningGameChannelData,
        message: ClientMessage<discord.Message>,
        text: string,
    ) {
        if (isNaN(+text)) return false;
        channel.game.handleTargettingCommand(command, message.author, { type: "index", content: +text }, message);
        return true;
    }
    async function handleCommand(
        command: string,
        channel: RunningGameChannelData,
        message: ClientMessage<discord.Message>,
        text: string,
    ) {
        channel.game.handleCommand(command, message.author, message);
        return true;
    }

    return {
        registerChannel(channel: discord.TextChannel) {
            channelList.push({
                type: "NOT_STARTED",
                channel,
            });
        },
        unregisterChannel(channel: discord.TextChannel) {
            channelList = channelList.filter(c => c.channel.id === channel.id);
        },
        createGame,
        joinGame,
        leaveGame,
        startGame,
        cancelGame,
        shouldMumble (message: ClientMessage<discord.Message>) {
            const userChannel = getUserChannel(message.author);
            if (!userChannel || userChannel.type !== "RUNNING") return false;
            const playerData = userChannel.game.context.players.filter(p => p.id === message.author)[0];
            if (!playerData) return false;
            return playerData.attributes.some(a => a === BROKEN);
        },
        async handleCommand (command: string, message: ClientMessage<discord.Message>, text: string) {
            const channel = getUserChannel(message.author);
            if (!channel || channel.type !== "RUNNING") return false;
            switch (command) {
                case "vote": return await handleTargetByNameCommand("vote", channel, message, text);
                case "vote-nb": return await handleTargetByIndexCommand("vote", channel, message, text);
                case "no-vote": return await handleCommand("no-vote", channel, message, text);
                case "break": return await handleTargetByNameCommand("break", channel, message, text);
                case "break-nb": return await handleTargetByIndexCommand("break", channel, message, text);
                case "save": return await handleTargetByNameCommand("save", channel, message, text);
                case "save-nb": return await handleTargetByIndexCommand("save", channel, message, text);
                case "spy": return await handleTargetByNameCommand("spy", channel, message, text);
                case "spy-nb": return await handleTargetByIndexCommand("spy", channel, message, text);
                case "skip": return await handleCommand("skip", channel, message, text);
            }
            return false;
        },
    };
}
