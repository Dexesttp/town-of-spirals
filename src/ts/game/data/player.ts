export type PlayerData = {
    id: string,
    username: string,
    nickname: string,
    roles: string[],
    attributes: string[],
};

export type PlayerInterface = {
    [playerID: string]: {
        sendMessage: (message: string) => Promise<void>,
    },
};
