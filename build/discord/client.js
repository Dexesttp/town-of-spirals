"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const config = require("../config");
const discord_js_1 = require("discord.js");
exports.client = new discord_js_1.Client();
exports.client.on("ready", () => {
    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Setting client data...`);
    exports.client.user.setUsername("Town of Spirals")
        .then(c => exports.client.user.setStatus("online"))
        .then(c => console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Client ready !`))
        .catch(e => {
        console.error(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Error while setting client data `);
        console.error(e);
    });
});
exports.client.login(config.TOKEN)
    .then((str) => {
    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Client started.`);
})
    .catch((e) => {
    console.error(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Error while starting client.`);
    console.error(e);
});
