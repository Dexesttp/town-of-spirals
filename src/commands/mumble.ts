import { Message } from "discord.js";
import { mumbleFlavours } from "../flavours/load-flavours";
import { getNickname, gameConfig } from "../data/game-config";
import getRandFromArray from "../utils/rand-from-array";

let mumbles: {userID: string, message: Message}[] = [];

export async function mumbleMessage(message: Message, mumbleShouldEdit: boolean) {
	if(!mumbleShouldEdit && message.deletable)
		message.delete().catch(e => { /* NO OP*/ });
	
	getNickname(message.author)
	.then(nickname => {
		const name = nickname || message.author.username;
		const flavour = getRandFromArray(mumbleFlavours, 1)[0];
		if(mumbleShouldEdit) {
			return message.edit(flavour(name, ''));
		}
		return (gameConfig.channel || message.channel).send(flavour(name, ''))
	})
	.then(m => {
		const userID = message.author.id;
		const previousMumblesFrom = mumbles.filter(m => m.userID === userID && m.message.deletable);
		mumbles.push({ userID, message: m as Message });
		return Promise.all(previousMumblesFrom.map(p => p.message.delete()));
	})
	.catch(e => console.error(`Could not edit message properly : ${JSON.stringify(e)}`));
}