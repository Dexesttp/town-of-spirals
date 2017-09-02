export const gameConfig = {
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