import { gameConfig, getNickname } from "./game-config";
import { checkEnd } from "./check-end";
import { timerA } from "./check-timer";
import getRandFromArray from "../utils/rand-from-array";
import { revealFlavours } from "../game/flavours/reveal-flavours";
import { enthrallFlavours, newDayFlavours, noEnthrallFlavours, startVoteFlavours } from "../game/flavours/load-flavours";
import * as moment from "moment";
import { VOTE_NB_COMMAND, VOTE_COMMAND } from "../constants";

export async function handleDay() {
    if (!gameConfig.channel)
        return;
    gameConfig.phase = "day";
    const newDayFlavor = getRandFromArray(newDayFlavours, 1)[0];
    gameConfig.channel.send(newDayFlavor());
    const sanePlayers = gameConfig.allPlayers.filter(p => !gameConfig.badoozledPlayers.some(b => b === p));
    const remainingVillagers = sanePlayers.some(p => !gameConfig.hypnotists.some(h => h === p));
    if (gameConfig.recentlyBadoozled.length) {
        gameConfig.channel.send(`The villagers all gather in the center of the village. Something is wrong.`);
        for (let broken of gameConfig.recentlyBadoozled) {
            const owner = getRandFromArray(sanePlayers, 1)[0];
            const enthrallFlavour = getRandFromArray(enthrallFlavours, 1)[0];
            const brokenNick = await getNickname(broken);
            const ownerNick = await getNickname(owner);
            gameConfig.channel.send(enthrallFlavour(brokenNick, ownerNick));
            if (remainingVillagers) {
                const wasTist = gameConfig.hypnotists.some(h => h === broken);
                const wasDetective = gameConfig.specials[broken.id] === "detective";
                const wasDeprogrammer = gameConfig.specials[broken.id] === "deprogrammer";
                const pickedRevealFlavour = wasTist
                ? getRandFromArray(revealFlavours.hypnotist, 1)[0]
                : wasDetective ? getRandFromArray(revealFlavours.detective, 1)[0]
                : wasDeprogrammer ? getRandFromArray(revealFlavours.deprogrammer, 1)[0]
                : getRandFromArray(revealFlavours.villager, 1)[0];
                gameConfig.channel.send(pickedRevealFlavour(broken));
            }
        }
    }
    else {
        const flavour = getRandFromArray(noEnthrallFlavours, 1)[0];
        gameConfig.channel.send(flavour());
    }
    gameConfig.votes = {};
    if (await checkEnd())
        return;
    gameConfig.recentlyBadoozled = [];
    const startVoteFlavour = getRandFromArray(startVoteFlavours, 1)[0];
    const targets = gameConfig.allPlayers.filter(p => !gameConfig.badoozledPlayers.some(b => b === p)).map(t => t.username);
    gameConfig.channel.send(`
${startVoteFlavour()}
The remaining villagers are : ${targets.map((t, id) => `[${id}] ${t}`).join(", ")}
Use \`${VOTE_COMMAND}\` to vote, or \`${VOTE_NB_COMMAND}\`
    `);
    timerA();
    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Day time !`);
}
