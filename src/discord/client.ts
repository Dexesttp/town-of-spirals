import * as moment from "moment";
import * as config from "../config";
import { Client } from "discord.js";

export const client = new Client();

client.on("ready", () => {
	console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Setting client data...`);
	client.user.setUsername("Town of Spirals")
	.then(c => client.user.setStatus("online"))
	.then(c => console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Client ready !`))
	.catch(e => {
		console.error(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Error while setting client data `);
		console.error(e)
	});
});

client.login(config.TOKEN)
.then((str) => {
	console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Client started.`);
})
.catch((e) => {
	console.error(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Error while starting client.`);
	console.error(e);
})
