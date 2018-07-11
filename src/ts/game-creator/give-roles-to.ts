import { PlayerData } from "../game/data/player";
import getRandom from "../utils/rand-from-array";
import { HYPNOTIST_ROLE } from "../roles/hypnotist";
import { DEPROGRAMMER_ROLE } from "../roles/deprogrammer";
import { DETECTIVE_ROLE } from "../roles/detective";

export function GiveRolesTo(players: PlayerData[]) {
    const tistsCount = Math.floor(players.length / 3);
    const tists = getRandom(players, tistsCount);
    for (const tist of tists)
        tist.roles.push(HYPNOTIST_ROLE);
    if (players.length > 3) {
        const deprogrammers = getRandom(players.filter(p => !p.roles.length), 1);
        for (const deprogrammer of deprogrammers)
            deprogrammer.roles.push(DEPROGRAMMER_ROLE);
    }
    if (players.length > 5) {
        const detectives = getRandom(players.filter(p => !p.roles.length), 1);
        for (const detective of detectives)
            detective.roles.push(DETECTIVE_ROLE);
    }
}
