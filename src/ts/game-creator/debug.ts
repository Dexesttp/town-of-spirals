import { PlayerData, PlayerInterface } from "../game/data/player";

export function GameCreator() {
    let players: PlayerData[] = [];
    let playerInterface: PlayerInterface = {};
    return {
        addPlayer(id: string) {
            if (players.filter(p => p.id === id).length) {
                return false;
            }
            players.push({
                id,
                username: id,
                nickname: id,
                attributes: [],
                roles: [],
            });
            playerInterface[id] = {
                async sendMessage(message: string) {
                    console.log(`>${id}>${message}`);
                },
            };
            return true;
        },
        removePlayer(id: string) {
            if (players.filter(p => p.id === id).length) {
                return false;
            }
            players = players.filter(p => p.id !== id);
            delete playerInterface[id];
            return true;
        },
        players() {
            return players;
        },
        playerInterface() {
            return playerInterface;
        },
    };
}
