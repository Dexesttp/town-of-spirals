import { PlayerData } from "../game/data/player";

export type FlavourData = {
    target?: PlayerData,
    random?: PlayerData,
    owner?: PlayerData,
    special?: {
        [key: string]: string,
    },
};

export type FlavourEngine = {
    [key: string]: Array<(data: FlavourData) => string>,
};

export type Flavour = {
    [key: string]: string,
};
