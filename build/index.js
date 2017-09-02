"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Discord = require("discord.js");
const moment = require("moment");
const jsonfile = require("jsonfile");
const handle_message_1 = require("./handle-message");
const client = new Discord.Client();
const config = jsonfile.readFileSync("config.json");
client.on("ready", () => {
    console.log("Client ready !");
});
client.on("message", message => {
    handle_message_1.handleMessage(message);
});
client.login(config.token)
    .then((str) => {
    console.log("Client started.");
    // console.log("Client started : " + str);
    // client.user.setUsername("Town of Spirals");
})
    .catch((e) => {
    moment.now();
    console.log("Error while starting client : " + e);
});
