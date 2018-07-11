import * as yaml from "js-yaml";
import {readFileSync} from "fs";
import { PlayerData } from "../data/player";
import { FlavourData, FlavourEngine } from "./types";

export function load(dataString: string): FlavourEngine {
    const flavourStrings = yaml.safeLoad(dataString);
    const result: FlavourEngine = {};
    for (const propertyName in flavourStrings) {
        if (!flavourStrings.hasOwnProperty(propertyName))
            continue;
        const item = flavourStrings[propertyName];
        if (!Array.isArray(item))
            continue;
        result[propertyName] = item.map(
            (originalText: string) =>
            (data: FlavourData) => {
                let text = originalText;
                if (data.target) {
                    text = text.replace(/\[target\]/ig, data.target.id);
                    text = text.replace(/\[targetMention\]/ig, `<@${data.target.id}>`);
                }
                if (data.owner) {
                    text = text.replace(/\[owner\]/ig, data.owner.id);
                    text = text.replace(/\[ownerMention\]/ig, `<@${data.owner.id}>`);
                }
                if (data.random) {
                    text = text.replace(/\[random\]/ig, data.random.id);
                    text = text.replace(/\[randomMention\]/ig, `<@${data.random.id}>`);
                }
                if (data.special) {
                    for (const specialName in data.special) {
                        if (data.special.hasOwnProperty(specialName)) {
                            text = text.replace(new RegExp(`\[${specialName}\]`, "g"), data.special[specialName]);
                        }
                    }
                }
                return text;
            },
        );
    }
    return result;
}

export function loadFile(path: string) {
    return load(readFileSync(path).toString());
}
