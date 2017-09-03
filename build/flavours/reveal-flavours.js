"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yaml = require("js-yaml");
const fs_1 = require("fs");
const result = yaml.safeLoad(fs_1.readFileSync("strings/reveals.yaml").toString());
exports.revealFlavours = {
    hypnotist: result.hypnotist.map((text) => (user) => text.replace(/\[name\]/ig, user.username).replace(/\[id\]/ig, user.id)),
    villager: result.villager.map((text) => (user) => text.replace(/\[name\]/ig, user.username).replace(/\[id\]/ig, user.id)),
    deprogrammer: result.deprogrammer.map((text) => (user) => text.replace(/\[name\]/ig, user.username).replace(/\[id\]/ig, user.id)),
    detective: result.detective.map((text) => (user) => text.replace(/\[name\]/ig, user.username).replace(/\[id\]/ig, user.id)),
};
