import { User, Channel, TextChannel } from "discord.js";

export const gameConfig: {
	allPlayers: User[],
	channel: TextChannel | null,
	gameStarter: User | null ,
} = {
	allPlayers: [],
	channel: null,
	gameStarter: null,	
}

export function sendChannelMessage(message: string) {
	gameConfig.channel.send(message);
}

export async function getNickname(author) {
	const guildUser = await gameConfig.channel.guild.fetchMember(author);
	return guildUser.nickname || author.username;
}