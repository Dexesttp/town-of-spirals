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
const reveal_flavours_1 = require("../flavours/reveal-flavours");
const vote_flavour_1 = require("../flavours/vote-flavour");
const rand_from_array_1 = require("../utils/rand-from-array");
function handleVote(target) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!game_config_1.gameConfig.channel)
            return;
        const alivePlayers = game_config_1.gameConfig.allPlayers.filter(p => !game_config_1.gameConfig.badoozledPlayers.some(b => b === p) && p !== target);
        const owner = rand_from_array_1.default(alivePlayers, 1)[0];
        const flavour = rand_from_array_1.default(vote_flavour_1.voteFlavours, 1)[0];
        const targetNick = yield game_config_1.getNickname(target);
        const ownerNick = yield game_config_1.getNickname(owner);
        game_config_1.gameConfig.channel.send(flavour(targetNick, ownerNick));
        const wasTist = game_config_1.gameConfig.hypnotists.some(h => h === target);
        const wasDetective = game_config_1.gameConfig.specials[target.id] === "detective";
        const wasDeprogrammer = game_config_1.gameConfig.specials[target.id] === "deprogrammer";
        const pickedRevealFlavour = wasTist
            ? rand_from_array_1.default(reveal_flavours_1.revealFlavours.hypnotist, 1)[0]
            : wasDetective ? rand_from_array_1.default(reveal_flavours_1.revealFlavours.detective, 1)[0]
                : wasDeprogrammer ? rand_from_array_1.default(reveal_flavours_1.revealFlavours.deprogrammer, 1)[0]
                    : rand_from_array_1.default(reveal_flavours_1.revealFlavours.villager, 1)[0];
        game_config_1.gameConfig.channel.send(pickedRevealFlavour(target));
    });
}
exports.handleVote = handleVote;
