import { PlayerData } from "../game/data/player";
import getRandom from "../utils/rand-from-array";
import { HYPNOTIST_ROLE } from "../roles/hypnotist";
import { DEPROGRAMMER_ROLE } from "../roles/deprogrammer";
import { DETECTIVE_ROLE } from "../roles/detective";

function GetRoleAssociations(count: number) {
    const roles: Array<{ role: string, count: number }> = [];
    roles.push({ role: HYPNOTIST_ROLE, count: Math.floor(count / 3) });
    roles.push({ role: DEPROGRAMMER_ROLE, count: 1 });
    if (count > 5) {
        roles.push({ role: DETECTIVE_ROLE, count: 1 });
    }
    return roles;
}

export function GiveRolesTo(players: PlayerData[]) {
    const roleAssociations = GetRoleAssociations(players.length);
    for (const association of roleAssociations) {
        const roledPlayers = getRandom(players.filter(p => !p.roles.length), association.count);
        for (const roledPlayer of roledPlayers) {
            roledPlayer.roles.push(association.role);
        }
    }
}
