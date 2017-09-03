import * as yaml from "js-yaml";
import {readFileSync} from "fs";

const result = yaml.safeLoad(readFileSync("strings/basic.yaml").toString());

export const newDayFlavours:  (() => void)[]
= result.newDay.map((text: string) => () => text);

export const enthrallFlavours: ((broken: string, owner: string) => string)[]
= result.enthrall.map((text: string) => (broken: string, owner: string) =>
	text.replace(/\[broken\]/ig, broken).replace(/\[owner\]/ig, owner)
);

export const mumbleFlavours: ((userName: string, ownerName: string) => void)[]
= result.mumble.map((text: string) => (name: string, owner: string) => 
	text.replace(/\[name\]/ig, name).replace(/\[owner\]/ig, owner)
);

export const noEnthrallFlavours: (() => string)[]
= result.noEnthrall.map((text: string) => () => text);

export const startVoteFlavours: (() => string)[]
= result.startVote.map((text: string) => () => text);

export const voteFlavours: ((target: string, owner: string) => void)[]
= result.break.map((text: string) => (broken: string, owner: string) =>
text.replace(/\[broken\]/ig, broken).replace(/\[owner\]/ig, owner)
);
