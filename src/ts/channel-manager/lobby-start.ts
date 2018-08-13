import * as discord from "discord.js";
import { writeFileSync } from "fs";
import * as moment from "moment";
import { ClientMessage } from "../client/type";
import { getFlavourList } from "../flavour/get-flavour-list";
import { Game, GameResult } from "../game";
import { GiveRolesTo } from "../game-creator/give-roles-to";
import { baseDay } from "../game/base-day";
import { baseNight } from "../game/base-night";
import { baseNotifyRoles } from "../game/base-notify-roles";
import { baseResolveAllBroken } from "../game/base-resolve-all-broken";
import logger from "../logging";
import { handleDeprogrammer } from "../roles/deprogrammer";
import { handleDetective } from "../roles/detective";
import { handleHypnotist } from "../roles/hypnotist";
import { checkEndWithJester } from "../roles/jester";
import getRandom from "../utils/rand-from-array";
import { MIN_PLAYERS, MIN_REVEAL_ROLES } from "./constants";
import { ManagerContext, NotStartedGameChannelData, RegisteredGameChannelData, RunningGameChannelData } from "./types";
import { getUserChannel } from "./utils";

export const flavourList = getFlavourList();

export function startGame(
    context: ManagerContext,
    updateStats: (channel: discord.TextChannel, result: GameResult) => void,
) {
    return async (message: discord.Message) => {
        const userData = getUserChannel(context)(message.author.id);
        if (userData === null) return;
        if (userData.type === "NOT_STARTED") {
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
            players.length >= MIN_REVEAL_ROLES,
        );

        const flavour = getRandom(flavourList, 1)[0];
        newData.game.setDay(baseDay(flavour.baseDay));
        newData.game.setNight(baseNight(flavour.baseNight));
        newData.game.setCheckEnd(checkEndWithJester(flavour.checkEnd, flavour.handleJester));
        newData.game.setNotifyRoles(baseNotifyRoles(flavour.notifyRoles));
        newData.game.setResolveAllBroken(baseResolveAllBroken(flavour.resolveBroken));
        newData.game.subscribeNightRole(handleHypnotist(flavour.handleHypnotist));
        newData.game.subscribeNightRole(handleDeprogrammer(flavour.handleDeprogrammer));
        newData.game.subscribeNightRole(handleDetective(flavour.handleDetective));

        logger.channel(channel.name, `Game started by ${message.author.username} ! (${players.length} players)`);
        newData.game.start()
            .then(result => {
                logger.channel(channel.name, `Game ended !`);
                updateStats(channel, result);
                delete newData.game;
                delete newData.createdDate;
                const endData = <NotStartedGameChannelData><RegisteredGameChannelData>newData;
                endData.type = "NOT_STARTED";
            })
            .catch(e => {
                logger.channel(channel.name, `Game Cashed :<`);
                console.error(e);
                writeFileSync(`log-${moment().format("YYYY-MM-DD-HH-mm-ss")}.json`, JSON.stringify(e));
                newData.channel.send("The game crashed ! Crash logs have been saved, and you can try to start a new game now hopefully.");
                delete newData.game;
                delete newData.createdDate;
                const endData = <NotStartedGameChannelData><RegisteredGameChannelData>newData;
                endData.type = "NOT_STARTED";
            });
    };
}
