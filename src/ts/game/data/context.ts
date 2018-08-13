import { PlayerData, PlayerInterface } from "./player";

export type GameContext = {
    players: PlayerData[],
    playerInterface: PlayerInterface,
    sendMessage: (message: string) => Promise<void>,
    reveal_roles?: boolean,
};

export type GameResult = Array<{ id: string, alive: boolean, role: string }>;
