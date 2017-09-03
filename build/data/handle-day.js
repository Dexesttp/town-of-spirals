"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const game_config_1 = require("./game-config");
const check_end_1 = require("./check-end");
const check_timer_1 = require("./check-timer");
const rand_from_array_1 = require("../utils/rand-from-array");
const reveal_flavours_1 = require("../flavours/reveal-flavours");
const load_flavours_1 = require("../flavours/load-flavours");
const moment = require("moment");
const constants_1 = require("../commands/constants");
function handleDay() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!game_config_1.gameConfig.channel)
            return;
        game_config_1.gameConfig.phase = "day";
        const flavour = rand_from_array_1.default(load_flavours_1.newDayFlavours, 1)[0];
        game_config_1.gameConfig.channel.send(flavour());
        const sanePlayers = game_config_1.gameConfig.allPlayers.filter(p => !game_config_1.gameConfig.badoozledPlayers.some(b => b === p));
        const remainingVillagers = sanePlayers.some(p => !game_config_1.gameConfig.hypnotists.some(h => h === p));
        if (game_config_1.gameConfig.recentlyBadoozled.length) {
            game_config_1.gameConfig.channel.send(`The villagers all gather in the center of the village. Something is wrong.`);
            for (let broken of game_config_1.gameConfig.recentlyBadoozled) {
                const owner = rand_from_array_1.default(sanePlayers, 1)[0];
                const flavour = rand_from_array_1.default(load_flavours_1.enthrallFlavours, 1)[0];
                const brokenNick = yield game_config_1.getNickname(broken);
                const ownerNick = yield game_config_1.getNickname(owner);
                game_config_1.gameConfig.channel.send(flavour(brokenNick, ownerNick));
                if (remainingVillagers) {
                    const wasTist = game_config_1.gameConfig.hypnotists.some(h => h === broken);
                    const wasDetective = game_config_1.gameConfig.specials[broken.id] === "detective";
                    const wasDeprogrammer = game_config_1.gameConfig.specials[broken.id] === "deprogrammer";
                    const pickedRevealFlavour = wasTist
                        ? rand_from_array_1.default(reveal_flavours_1.revealFlavours.hypnotist, 1)[0]
                        : wasDetective ? rand_from_array_1.default(reveal_flavours_1.revealFlavours.detective, 1)[0]
                            : wasDeprogrammer ? rand_from_array_1.default(reveal_flavours_1.revealFlavours.deprogrammer, 1)[0]
                                : rand_from_array_1.default(reveal_flavours_1.revealFlavours.villager, 1)[0];
                    game_config_1.gameConfig.channel.send(pickedRevealFlavour(broken));
                }
            }
        }
        else {
            const flavour = rand_from_array_1.default(load_flavours_1.noEnthrallFlavours, 1)[0];
            game_config_1.gameConfig.channel.send(flavour());
        }
        game_config_1.gameConfig.votes = {};
        if (yield check_end_1.checkEnd())
            return;
        game_config_1.gameConfig.recentlyBadoozled = [];
        const startVoteFlavour = rand_from_array_1.default(load_flavours_1.startVoteFlavours, 1)[0];
        var targets = game_config_1.gameConfig.allPlayers.filter(p => !game_config_1.gameConfig.badoozledPlayers.some(b => b === p)).map(t => t.username);
        game_config_1.gameConfig.channel.send(`
${startVoteFlavour()}
The remaining villagers are : ${targets.map((t, id) => `[${id}] ${t}`).join(", ")}
Use \`${constants_1.VOTE_COMMAND}\` to vote, or \`${constants_1.VOTE_NB_COMMAND}\`
	`);
        check_timer_1.timerA();
        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Day time !`);
    });
}
exports.handleDay = handleDay;
