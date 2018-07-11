import { User, Channel, TextChannel } from "discord.js";

export type SpecialRole = "detective" | "deprogrammer";

type GameConfig = {
    gameStarter: User | null,
    channel: TextChannel | null,
    phase: "day" | "night" | null,
    allPlayers: User[],
    hypnotists: User[],
    specials: {[userID: string]: SpecialRole},
    badoozledPlayers: User[],
    recentlyBadoozled: User[],
    votes: {[key: string]: string | null | undefined},
};

export const gameConfig: GameConfig = {
    gameStarter: null,
    channel: null,
    phase: null,
    allPlayers: [],
    hypnotists: [],
    specials: {},
    badoozledPlayers: [],
    recentlyBadoozled: [],
    votes: {},
};

export async function getNickname(author: User | null) {
    if (!author || !gameConfig.channel)
        return "";
    const guildUser = await gameConfig.channel.guild.fetchMember(author);
    return guildUser.nickname || author.username;
}
