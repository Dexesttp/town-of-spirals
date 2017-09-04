import * as moment from "moment";
import { Message, Client } from "discord.js";
import { timeout } from "../utils/timeout";

let COMMAND_MATCHER = /^!s ([^\s]+)( (.+))?$/i;

let before: ((message: Message) => Promise<boolean>)[] = [];
let handlers: {command: string, handler: (message: Message, messageContent: string) => Promise<boolean>}[] = [];

export async function messageHandler(message: Message) {
	for(let beforeHandler of before) {
		const result = await beforeHandler(message);
		if(result) return;
	}
	const match = COMMAND_MATCHER.exec(message.content);
	if(match) {
		console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Received command : '${match[1]}'`);
		for(let handler of handlers) {
			if(handler.command !== match[1])
				continue;
			const result = await handler.handler(message, match[3]);
			if(result)
				return;
		}
		const m = await message.channel.send(`Unknown command : ${match[1]}`)
		await timeout(3000);
		await (<Message> m).delete();
	}
}

/**
 * Set a handler before the message is sent.
 * @param handler The before handler, should return true to block the message from being propagated.
 */
export function onBefore(handler: (message: Message) => Promise<boolean>) {
	before.push(handler);
	return () => {
		before = before.filter(h => h !== handler);
	}
}

/**
 * Add a command to the thingy.
 * @param command the command to match against
 * @param handler The command handler, should return true to block the message from being propagated.
 */
export function on(command: string, handler: (message: Message, commandContent: string) => Promise<boolean>) {
	handlers.push({ command, handler });
	return () => {
		handlers = handlers.filter(h => h.command !== command || h.handler !== handler);
	}
}