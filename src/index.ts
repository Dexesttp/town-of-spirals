import * as Discord from "discord.js";
import * as moment from "moment";
import * as jsonfile from "jsonfile";

import {handleMessage} from "./handle-message";

const client = new Discord.Client();

const config = jsonfile.readFileSync("config.json");

client.on("ready", () => {
	console.log("Client ready !");
});

client.on("message", message => {
	handleMessage(message);
});

client.login(config.token)
.then((str) => {
	console.log("Client started.");
	// console.log("Client started : " + str);
	// client.user.setUsername("Town of Spirals");
})
.catch((e) => {
	moment.now()
	console.log("Error while starting client : " + e);
})
