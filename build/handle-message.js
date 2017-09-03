"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./commands/constants");
const create_game_1 = require("./commands/create-game");
const cancel_create_1 = require("./commands/cancel-create");
const start_game_1 = require("./commands/start-game");
const get_role_1 = require("./commands/get-role");
const vote_1 = require("./commands/vote");
const join_1 = require("./commands/join");
const reveal_flavours_1 = require("./flavours/reveal-flavours");
const vote_flavour_1 = require("./flavours/vote-flavour");
const leave_1 = require("./commands/leave");
const new_day_flavours_1 = require("./flavours/new-day-flavours");
const no_enthrall_flavours_1 = require("./flavours/no-enthrall-flavours");
const enthrall_flavours_1 = require("./flavours/enthrall-flavours");
const start_vote_flavours_1 = require("./flavours/start-vote-flavours");
const deprogram_1 = require("./commands/deprogram");
const spy_1 = require("./commands/spy");
const help_1 = require("./commands/help");
const VOTE_COMMAND_REGEXP = /^!s vote (.+)$/ig;
const SPY_COMMAND_REGEXP = /^!s spy (.+)$/ig;
const BREAK_COMMAND_REGEXP = /^!s break (.+)$/ig;
const MESSAGE_COMMAND_REGEXP = /^!s message (.+) (.+)$/ig;
function handleMessage(message) {
    switch (message.content) {
        case constants_1.HELP_COMMAND:
            help_1.handleHelp(message);
            return;
        case constants_1.RULES_COMMAND:
            help_1.handleRules(message);
            return;
        case constants_1.CREATE_COMMAND:
            if (create_game_1.createGame(message))
                join_1.join(message);
            return;
        case constants_1.CANCEL_CREATE_COMMAND:
            cancel_create_1.cancelCreate(message);
            return;
        case constants_1.JOIN_COMMAND:
            join_1.join(message);
            return;
        case constants_1.LEAVE_COMMAND:
            leave_1.leave(message);
            return;
        case constants_1.START_COMMAND:
            start_game_1.startGame(message);
            return;
        case constants_1.ROLE_COMMAND:
            get_role_1.getRole(message);
            return;
        case constants_1.NO_VOTE_COMMAND:
            vote_1.handleVote(message, null);
            return;
        case constants_1.SAVE_COMMAND:
            deprogram_1.setSave(message);
            return;
        case constants_1.SKIP_COMMAND:
            deprogram_1.setSkip(message);
            return;
        default:
            break;
    }
    const voteData = VOTE_COMMAND_REGEXP.exec(message.content);
    if (voteData) {
        let voteTarget = voteData[1];
        if (message.mentions.members && message.mentions.members) {
            const member = message.mentions.members.first();
            if (member)
                voteTarget = member.user.username;
        }
        vote_1.handleVote(message, voteTarget);
        return;
    }
    const spyData = SPY_COMMAND_REGEXP.exec(message.content);
    if (spyData) {
        spy_1.handleSpy(message, spyData[1]);
        return;
    }
    const breakData = BREAK_COMMAND_REGEXP.exec(message.content);
    if (breakData) {
        deprogram_1.setBreak(message, breakData[1]);
        return;
    }
    const messageData = MESSAGE_COMMAND_REGEXP.exec(message.content);
    if (messageData) {
        try {
            switch (messageData[1]) {
                case "new-day":
                    {
                        const flavour = new_day_flavours_1.newDayFlavours[+(messageData[2])];
                        message.channel.send(flavour());
                    }
                    ;
                    return;
                case "no-enthrall":
                    {
                        const flavour = no_enthrall_flavours_1.noEnthrallFlavours[+(messageData[2])];
                        message.channel.send(flavour());
                    }
                    ;
                    return;
                case "enthrall":
                    {
                        const flavour = enthrall_flavours_1.enthrallFlavours[+(messageData[2])];
                        message.channel.send(flavour(message.author.username, message.author.username));
                    }
                    ;
                    return;
                case "start-vote":
                    {
                        const flavour = start_vote_flavours_1.startVoteFlavours[+(messageData[2])];
                        message.channel.send(flavour([]));
                    }
                    ;
                    return;
                case "reveal-hypnotist":
                    {
                        const flavour = reveal_flavours_1.revealFlavours.hypnotist[+(messageData[2])];
                        message.channel.send(flavour(message.author));
                    }
                    ;
                    return;
                case "reveal-villager":
                    {
                        const flavour = reveal_flavours_1.revealFlavours.villager[+(messageData[2])];
                        message.channel.send(flavour(message.author));
                    }
                    ;
                    return;
                case "reveal-detective":
                    {
                        const flavour = reveal_flavours_1.revealFlavours.detective[+(messageData[2])];
                        message.channel.send(flavour(message.author));
                    }
                    ;
                    return;
                case "reveal-deprogrammer":
                    {
                        const flavour = reveal_flavours_1.revealFlavours.deprogrammer[+(messageData[2])];
                        message.channel.send(flavour(message.author));
                    }
                    ;
                    return;
                case "vote":
                    {
                        const flavour = vote_flavour_1.voteFlavours[+(messageData[2])];
                        message.channel.send(flavour(message.author.username, message.author.username));
                    }
                    ;
                    return;
                default:
                    message.channel.send(`Invalid flavour : ${messageData[1]}. Available ones are \`new-day\`, \`no-enthrall\`, \`enthrall\`, \`start-vote\`, \`hypnotist-reveal\`, \`villager-reveal\`, \`vote\`.`);
            }
        }
        catch (e) {
            message.channel.send(`Invalid flavour index : ${messageData[2]}.`);
        }
        return;
    }
}
exports.handleMessage = handleMessage;
