"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const load_flavours_1 = require("../flavours/load-flavours");
const reveal_flavours_1 = require("../flavours/reveal-flavours");
function printMessage(message, flavourGroup, flavourID) {
    try {
        switch (flavourGroup) {
            case "new-day":
                {
                    const flavour = load_flavours_1.newDayFlavours[flavourID];
                    message.channel.send(flavour());
                }
                ;
                return;
            case "no-enthrall":
                {
                    const flavour = load_flavours_1.noEnthrallFlavours[flavourID];
                    message.channel.send(flavour());
                }
                ;
                return;
            case "enthrall":
                {
                    const flavour = load_flavours_1.enthrallFlavours[flavourID];
                    message.channel.send(flavour(message.author.username, message.author.username));
                }
                ;
                return;
            case "start-vote":
                {
                    const flavour = load_flavours_1.startVoteFlavours[flavourID];
                    message.channel.send(flavour());
                }
                ;
                return;
            case "reveal-hypnotist":
                {
                    const flavour = reveal_flavours_1.revealFlavours.hypnotist[flavourID];
                    message.channel.send(flavour(message.author));
                }
                ;
                return;
            case "reveal-villager":
                {
                    const flavour = reveal_flavours_1.revealFlavours.villager[flavourID];
                    message.channel.send(flavour(message.author));
                }
                ;
                return;
            case "reveal-detective":
                {
                    const flavour = reveal_flavours_1.revealFlavours.detective[flavourID];
                    message.channel.send(flavour(message.author));
                }
                ;
                return;
            case "reveal-deprogrammer":
                {
                    const flavour = reveal_flavours_1.revealFlavours.deprogrammer[flavourID];
                    message.channel.send(flavour(message.author));
                }
                ;
                return;
            case "vote":
                {
                    const flavour = load_flavours_1.voteFlavours[flavourID];
                    message.channel.send(flavour(message.author.username, message.author.username));
                }
                ;
                return;
            default:
                message.channel.send(`Invalid flavour : ${flavourGroup}. Available ones are \`new-day\`, \`no-enthrall\`, \`enthrall\`, \`start-vote\`, \`hypnotist-reveal\`, \`villager-reveal\`, \`vote\`.`);
        }
    }
    catch (e) {
        message.channel.send(`Invalid flavour index : ${flavourID}.`);
    }
}
exports.printMessage = printMessage;
