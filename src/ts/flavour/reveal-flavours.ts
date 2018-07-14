import { User } from "discord.js";
import * as yaml from "js-yaml";
import {readFileSync} from "fs";

type FlavourBuilder = (target: User) => string;

const result = yaml.safeLoad(readFileSync("strings/reveals.yaml").toString());

export const revealFlavours: {
    hypnotist: FlavourBuilder[],
    villager: FlavourBuilder[],
    detective: FlavourBuilder[],
    deprogrammer: FlavourBuilder[],
} = {
    hypnotist: result.hypnotist.map(
        (text: string) => (user: User) => text.replace(/\[name\]/ig, user.username).replace(/\[id\]/ig, user.id),
    ),
    villager: result.villager.map(
        (text: string) => (user: User) => text.replace(/\[name\]/ig, user.username).replace(/\[id\]/ig, user.id),
    ),
    deprogrammer: result.deprogrammer.map(
        (text: string) => (user: User) => text.replace(/\[name\]/ig, user.username).replace(/\[id\]/ig, user.id),
    ),
    detective: result.detective.map(
        (text: string) => (user: User) => text.replace(/\[name\]/ig, user.username).replace(/\[id\]/ig, user.id),
    ),
};
