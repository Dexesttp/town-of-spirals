import { Message } from "discord.js";
import { newDayFlavours, noEnthrallFlavours, enthrallFlavours, startVoteFlavours, voteFlavours } from "../game/flavours/load-flavours";
import { revealFlavours } from "../game/flavours/reveal-flavours";

export function printMessage(message: Message, flavourGroup: string, flavourID: number) {
    try {
        switch (flavourGroup) {
            case "new-day": {
                const flavour = newDayFlavours[flavourID];
                message.channel.send(flavour());
            } return;
            case "no-enthrall": {
                const flavour = noEnthrallFlavours[flavourID];
                message.channel.send(flavour());
            } return;
            case "enthrall": {
                const flavour = enthrallFlavours[flavourID];
                message.channel.send(flavour(message.author.username, message.author.username));
            } return;
            case "start-vote": {
                const flavour = startVoteFlavours[flavourID];
                message.channel.send(flavour());
            } return;
            case "reveal-hypnotist": {
                const flavour = revealFlavours.hypnotist[flavourID];
                message.channel.send(flavour(message.author));
            } return;
            case "reveal-villager": {
                const flavour = revealFlavours.villager[flavourID];
                message.channel.send(flavour(message.author));
            } return;
            case "reveal-detective": {
                const flavour = revealFlavours.detective[flavourID];
                message.channel.send(flavour(message.author));
            } return;
            case "reveal-deprogrammer": {
                const flavour = revealFlavours.deprogrammer[flavourID];
                message.channel.send(flavour(message.author));
            } return;
            case "vote": {
                const flavour = voteFlavours[flavourID];
                message.channel.send(flavour(message.author.username, message.author.username));
            } return;
            default:
            message.channel.send(
                // tslint:disable-next-line:max-line-length
                `Invalid flavour : ${flavourGroup}. Available ones are \`new-day\`, \`no-enthrall\`, \`enthrall\`, \`start-vote\`, \`hypnotist-reveal\`, \`villager-reveal\`, \`vote\`.`,
            );
        }
    } catch (e) {
        message.channel.send(`Invalid flavour index : ${flavourID}.`);
    }
}
