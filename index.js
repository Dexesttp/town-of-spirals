//@ts-check
const Discord = require("discord.js");
const moment = require("moment");
const jsonfile = require("jsonfile");

const handleMessage = require("./handle-message");

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
	// client.user.setUsername("_Town of Spirals_");
})
.catch((e) => {
	moment.now()
	console.log("Error while starting client : " + e);
})
