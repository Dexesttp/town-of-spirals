import * as moment from "moment";
import { JOIN_COMMAND, START_COMMAND, CANCEL_CREATE_COMMAND } from "../constants";
import { Message } from "discord.js";
import { CREATE_COMMAND } from "../constants";
import { PlayerData, PlayerInterface } from "../game/data/player";

export function GameCreator(
    timeBeforeCancel: 5,
) {
    let players: PlayerData[] = [];
    let playerInterface: PlayerInterface = {};
    const createdDate = moment();
    return {
        async addPlayer(discordMessage: Message) {
            const author = discordMessage.author;
            if (players.filter(p => p.id === author.id).length) {
                return false;
            }
            const guildUser = await discordMessage.guild.fetchMember(author);
            players.push({
                id: author.id,
                username: author.username,
                nickname: guildUser.displayName,
                attributes: [],
                roles: [],
            });
            playerInterface[author.id] = {
                async sendMessage(message: string) {
                    author.sendMessage(message);
                },
            };
            return true;
        },
        removePlayer(discordMessage: Message) {
            const author = discordMessage.author;
            if (players.filter(p => p.id === author.id).length) {
                return false;
            }
            players = players.filter(p => p.id !== author.id);
            delete playerInterface[author.id];
            return true;
        },
        players() {
            return players;
        },
        playerInterface() {
            return playerInterface;
        },
        canCancelCreation() {
            return createdDate.add(timeBeforeCancel, "minutes") < moment();
        },
    };
}

const MIN_PLAYERS = 3;
const HYPNOTISTS_PERCENT = 0.34;

function cancelCreate(message: Message) {
    const noGameToCancelMessage = (
        `No game running. Type \`${CREATE_COMMAND}\` create a new game.`
    );
    const cannotCnacelMessage = (
        `The game has been created less than 5 minutes ago (or has been running for less than 30minutes), and you can't cancel it yet.`
    );
    const cancelledMessage = (
        `Game cancelled. Type \`${CREATE_COMMAND}\` create a new game.`
    );
}

function createGame(message: Message) {
    const gameAlreadyExists = (
        // tslint:disable-next-line:max-line-length
        `There's already a game created by [author]. Type \`${JOIN_COMMAND}\` to join the game ! ([playerCount] player(s))`
    );
    const wrongChannel = (
        `You cannot start a game here. Go to a server channel.`
    );
    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message.author.username} created a game !`);
    const gameStarted = (
        `Game started. Type \`${JOIN_COMMAND}\` to join the game, and \`${START_COMMAND}\` to start it !`
    );
    return true;
}

function startGame(message: Message) {
    const cannotStartNoGame = (
        `No game started. Start a game first with \`${CREATE_COMMAND}\`.`
    );
    const cannotStartNotOwner = (
        `This game was created by [author].
        They should start the game, or you should use the \`${CANCEL_CREATE_COMMAND}\` command to cancel the game.`
    );
    const cannotStartPlayerCount = (
        `There's currently less than ${MIN_PLAYERS} players in the game. Bring some more friends to play !`
    );
    const startingGame = (
        `Starting the game...`
    );
}

function joinGame (message: Message) {
    const noGameStarted = (
        `No game started. Start a game first with \`${CREATE_COMMAND}\`.`
    );
    const gameAlreadyRunning = (
        `The game is in progress, [player]. Wait for the next one :D`
    );
    const alreadyJoined = (
        `You already joined, [player]. [playerCount] player(s).`
    );
    const joined = (
        `[player] joined the game ([playerCount] player(s)`
    );

}

function leaveGame(message: Message) {
    const noGameStarted = (
        `No game started. Start a game first with \`${CREATE_COMMAND}\`.`
    );
    const notJoined = (
        `You didn't join, [player]. No point in leaving.`
    );
    const gameCurrentlyRunning = (
        `The game is in progress, [player]. You can't leave a running game !`
    );
    const left = (
        `[player] left the game ([playerCount] player(s))`
    );
}
