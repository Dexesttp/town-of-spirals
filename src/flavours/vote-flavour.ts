import { User, TextChannel } from "discord.js";
import { gameConfig } from "../data/game-config";
import { gameData } from "../data/game-data";

export const voteFlavours: 
((channel: TextChannel, target: User, owner: User) => void)[]
= [
	(channel, target, owner) => channel.send(`
<@${target.id}> has been chosen as the victim.
The town gather as <@${target.id}> is brought to the chair.
The chair begins its magic, and <@${target.id}> slowly feels their mind slipping away.
After a while, they stop struggling. They're let free to wander around, not able to think much anymore.
<@${owner.id}> decides to take <@${target.id}> in and take care of them.
	`),
];
