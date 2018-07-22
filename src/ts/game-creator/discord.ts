import { Message } from "discord.js";
import { PlayerData, PlayerInterface } from "../game/data/player";

export type DiscordGameCreator = {
    addPlayer: (message: Message) => Promise<PlayerData | null>,
    removePlayer: (message: Message) => Promise<boolean>,
    players: () => PlayerData[],
    playerInterface: () => PlayerInterface,
};

export function GameCreator(
): DiscordGameCreator {
    let players: PlayerData[] = [];
    let playerInterface: PlayerInterface = {};
    return {
        async addPlayer(discordMessage: Message) {
            const author = discordMessage.author;
            if (players.filter(p => p.id === author.id).length) {
                return null;
            }
            const guildUser = await discordMessage.guild.fetchMember(author);
            const data = {
                id: author.id,
                username: author.username,
                nickname: guildUser.displayName || author.username,
                attributes: [],
                roles: [],
            };
            players.push(data);
            playerInterface[author.id] = {
                async sendMessage(message: string) {
                    author.sendMessage(message);
                },
            };
            return data;
        },
        async removePlayer(discordMessage: Message) {
            const author = discordMessage.author;
            if (players.filter(p => p.id === author.id).length) {
                return false;
            }
            players = players.filter(p => p.id !== author.id);
            delete playerInterface[author.id];
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
