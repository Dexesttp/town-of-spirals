import * as moment from "moment";
import { GetCommandHandler } from "./client/command-handler";
import { GetClient } from "./client/repl";
import { ALLOW_MUMBLE, MUMBLE_SHOULD_EDIT, CAN_DELETE_MESSAGES } from "./config";
import { help } from "./commands/help";
import { rules } from "./commands/rules";
import { GameCreator } from "./game-creator/debug";
import { Game, GameData } from "./game/index";
import { GiveRolesTo } from "./game-creator/give-roles-to";
import { handleDetective } from "./roles/detective";
import { handleDeprogrammer } from "./roles/deprogrammer";
import { handleHypnotist } from "./roles/hypnotist";

moment.relativeTimeThreshold("ss", 1);
moment.relativeTimeThreshold("s", 60);
moment.relativeTimeThreshold("m", 60);

const client = GetClient();
const command = GetCommandHandler((_, text) => client.send(text));
client.onMessageReceived(command.messageHandler);
client.setCommandGetter(command.commands);

const gameCreator = GameCreator();
let game: GameData | null = null;

/** Mumbling */
command.onBefore(async message => {
    return false;
});

command.on("help", async (message, text) => {
    client.sendTo(message.author, help(message));
    return true;
});

command.on("rules", async (message, text) => {
    client.sendTo(message.author, rules(message));
    return true;
});

command.on("join-many", async (message, text) => {
    const value = +text;
    if (!value) {
        console.log(`${text} isn't a valid argument. Please use a number > 0.`);
        return true;
    }
    const players = [...new Array(value)].map((v, i) => i + 1);
    for (const playerID of players) {
        console.log(`Adding player ${playerID}.`);
        gameCreator.addPlayer(`${playerID}`);
    }
    return true;
});

command.on("join", async (message, text) => {
    gameCreator.addPlayer(message.author);
    return true;
});

command.on("leave", async (message, text) => {
    gameCreator.removePlayer(message.author);
    return true;
});

command.on("start", async(message, text) => {
    const players = gameCreator.players();
    if (players.length < 4) {
        console.log(`Not enough players to start (current : ${players.length}, need: ${4})`);
        return true;
    }
    GiveRolesTo(players);
    game = Game(
        players,
        async (m) => { console.log(`>${m}`); },
        gameCreator.playerInterface(),
        async (m) => false,
    );
    game.subscribeNightRole(handleHypnotist);
    game.subscribeNightRole(handleDeprogrammer);
    game.subscribeNightRole(handleDetective);
    game.start();
    return true;
});

command.on("vote", async (message, text) => {
    if (!game) {
        console.log("There's no game started.");
        return true;
    }
    const target = game.context.players.filter(p => p.id === text)[0];
    if (!target) {
        console.log("Unknown player.");
        return true;
    }
    game.handleTargettingCommand("vote", message.author, target.id, message);
    return true;
});

command.on("no-vote", async (message, text) => {
    if (!game) {
        console.log("There's no game started.");
        return true;
    }
    game.handleCommand("no-vote", message.author, message);
    return true;
});

command.on("break", async (message, text) => {
    if (!game) {
        console.log("There's no game started.");
        return true;
    }
    const target = game.context.players.filter(p => p.id === text)[0];
    game.handleTargettingCommand("break", message.author, target.id, message);
    return true;
});

command.on("save", async (message, text) => {
    if (!game) {
        console.log("There's no game started.");
        return true;
    }
    const target = game.context.players.filter(p => p.id === text)[0];
    game.handleTargettingCommand("save", message.author, target.id, message);
    return true;
});

command.on("spy", async (message, text) => {
    if (!game) {
        console.log("There's no game started.");
        return true;
    }
    const target = game.context.players.filter(p => p.id === text)[0];
    game.handleTargettingCommand("spy", message.author, target.id, message);
    return true;
});

command.on("skip", async (message, text) => {
    if (!game) {
        console.log("There's no game started.");
        return true;
    }
    game.handleCommand("skip", message.author, message);
    return true;
});
