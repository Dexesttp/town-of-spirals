import { Message } from "../../client/type";
import { PlayerData } from "../data/player";

export type TargettingPromiseGetter = (
  command: string,
  players: PlayerData[],
  targets: PlayerData[],
  shouldBePrivate: boolean
) => Promise<TargettingCommandData>;

export type InputTargetType =
  | { type: "id"; content: string }
  | { type: "index"; content: number };

export type TargettingHandler = (
  command: string,
  playerID: string,
  target: InputTargetType,
  message: Message
) => void;

export type TargettingCommandData = {
  playerID: string;
  targetID: string;
};
