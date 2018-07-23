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
import { baseDay } from "./game/base-day";
import { baseResolveAllBroken } from "./game/base-resolve-all-broken";
import { baseNotifyRoles } from "./game/base-notify-roles";
import { baseCheckEnd } from "./game/base-check-end";
import { baseNight } from "./game/base-night";
import { getFlavourList } from "./flavour/get-flavour-list";
import getRandom from "./utils/rand-from-array";
import { TimeoutPromise, TimerPromise } from "./utils/timer";

type NotStartedGameChannelData = {
    type: "NOT_STARTED",
    channel: discord.TextChannel,
};
type CreatingGameChannelData = {
    type: "CREATING",
    channel: discord.TextChannel,
    createdDate: moment.Moment,
    creator: DiscordGameCreator,
    timeout: TimeoutPromise,
};
type RunningGameChannelData = {
    type: "RUNNING",
    channel: discord.TextChannel,
    createdDate: moment.Moment,
    game: GameData,
};

export const flavourList = getFlavourList();

export type RegisteredGameChannelData =
NotStartedGameChannelData
| CreatingGameChannelData
| RunningGameChannelData;

export function ChannelManager(
    timeBeforeCancelInMinutes = 5,
    GAME_TIMEOUT = 15 * 60 * 1000,
) {
    const MIN_PLAYERS = 4;
    let channelList: RegisteredGameChannelData[] = [];

    function resetGame(data: CreatingGameChannelData) {
        delete data.createdDate;
        delete data.creator;
        if (data.timeout.cancel) data.timeout.cancel();
        delete data.timeout;
        const newData = <NotStartedGameChannelData><RegisteredGameChannelData>data;
        newData.type = "NOT_STARTED";
    }

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
        newData.timeout = TimerPromise(GAME_TIMEOUT);
        newData.timeout.then(_ => {
            resetGame(newData);
            console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Game cancelled in ${data.channel.name} : timeout.`);
            return channel.send("15 minutes timeout, game cancelled ! Type `!s create` to create a new game.");
        });
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
        resetGame(data);
        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Game cancelled in ${data.channel.name} by ${message.author.username}.`);
        await channel.send("Game cancelled ! Type `!s create` to create a new game.");
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
        if (data.timeout.cancel) data.timeout.cancel();
        data.timeout = TimerPromise(GAME_TIMEOUT);
        data.timeout.then(_ => {
            resetGame(data);
            console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Game cancelled in ${data.channel.name} : timeout.`);
            return channel.send("15 minutes timeout, game cancelled ! Type `!s create` to create a new game.");
        });
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
        await data.creator.removePlayer(message);
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
        if (userData.timeout.cancel) userData.timeout.cancel();
        delete userData.timeout;
        const newData = <RunningGameChannelData><RegisteredGameChannelData>userData;
        newData.type = "RUNNING";
        GiveRolesTo(players);
        newData.game = Game(
            players,
            async (m) => {
                if (m == null) return;
                await channel.send(m);
            },
            creator.playerInterface(),
            async (m) => {
                const original = (m as ClientMessage<discord.Message>).original;
                if (!original.deletable) return false;
                await original.delete();
                return true;
            },
        );

        const flavour = getRandom(flavourList, 1)[0];
        newData.game.setDay(baseDay(flavour.baseDay));
        newData.game.setNight(baseNight(flavour.baseNight));
        newData.game.setCheckEnd(baseCheckEnd(flavour.checkEnd));
        newData.game.setNotifyRoles(baseNotifyRoles(flavour.notifyRoles));
        newData.game.setResolveAllBroken(baseResolveAllBroken(flavour.resolveBroken));
        newData.game.subscribeNightRole(handleHypnotist(flavour.handleHypnotist));
        newData.game.subscribeNightRole(handleDeprogrammer(flavour.handleDeprogrammer));
        newData.game.subscribeNightRole(handleDetective(flavour.handleDetective));

        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message.author.username} started a game in ${channel.name}`);
        newData.game.start()
        .then(() => {
            // TODO handle stats.
            delete newData.game;
            delete newData.createdDate;
            const endData = <NotStartedGameChannelData><RegisteredGameChannelData>newData;
            endData.type = "NOT_STARTED";
        });
    }

    async function handleTargetByNameCommand(
        command: string,
        channel: RunningGameChannelData,
        message: ClientMessage<discord.Message>,
        text: string,
    ) {
        let target = channel.game.context.players.filter(p => p.nickname === text)[0]
            || channel.game.context.players.filter(p => p.username === text)[0]
            || channel.game.context.players.filter(p => `@${p.nickname}` === text)[0]
            || channel.game.context.players.filter(p => `@${p.username}` === text)[0]
            || channel.game.context.players.filter(p => `<@${p.id}>` === text)[0]
            || channel.game.context.players.filter(p => `<@!${p.id}>` === text)[0];
        if (!target) {
            message.original.channel.send(`Cannot find target player: ${text} in the current game.`);
            return true;
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
        channel.game.handleTargettingCommand(command, message.author, { type: "index", content: (+text - 1) }, message);
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
