import { PlayerData, PlayerInterface } from "./player";

export type GameContext = {
    players: PlayerData[],
    playerInterface: PlayerInterface,
    sendMessage: (message: string) => Promise<void>,
};