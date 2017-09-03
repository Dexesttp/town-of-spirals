import * as Discord from "discord.js";
import * as moment from "moment";
import * as jsonfile from "jsonfile";

import {handleMessage} from "./handle-message";

const client = new Discord.Client();

const config = jsonfile.readFileSync("config.json");

const CAN_DELETE_MESSAGES = config.canDelete || false;

client.on("ready", () => {
	console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Client ready !`);
	client.user.setUsername("Town of Spirals")
	.then(c => client.user.setStatus("online"))
	.then(c => {
		console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Client ready !`);
	})
	.catch(e => {
		console.error(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Error while setting client data `);
		console.error(e)
	});
});

client.on("message", async message => {
	if(message.content ===  "!s cleanMessages") {
		if(!CAN_DELETE_MESSAGES) {
			console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] CanDelete is disabled.`);		
			return;
		}
		const postedMessages = await message.channel.fetchMessages({
			limit: 100,
		});
		const messagesToDelete = postedMessages.filter(m => m.author === client.user);
		console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Deleting ${messagesToDelete.size} messages.`);
		for(let messageToDelete of messagesToDelete) {
			messageToDelete[1].delete();
		}
		return;
	}
	handleMessage(message);
});

client.login(config.token)
.then((str) => {
	console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Client started.`);
})
.catch((e) => {
	moment.now()
	console.error(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Error while starting client.`);
	console.error(e);
})
