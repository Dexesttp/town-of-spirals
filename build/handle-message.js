"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./commands/constants");
const create_game_1 = require("./commands/create-game");
const cancel_create_1 = require("./commands/cancel-create");
const start_game_1 = require("./commands/start-game");
const get_role_1 = require("./commands/get-role");
const vote_1 = require("./commands/vote");
const join_1 = require("./commands/join");
const moment = require("moment");
const reveal_flavours_1 = require("./flavours/reveal-flavours");
const leave_1 = require("./commands/leave");
const load_flavours_1 = require("./flavours/load-flavours");
const deprogram_1 = require("./commands/deprogram");
const spy_1 = require("./commands/spy");
const help_1 = require("./commands/help");
const game_config_1 = require("./data/game-config");
const rand_from_array_1 = require("./utils/rand-from-array");
const VOTE_NUMBER_COMMAND_REGEXP = /^!s vote-nb (\d+)$/i;
const VOTE_COMMAND_REGEXP = /^!s vote (.+)$/i;
const VOTE_ID_COMMAND_REGEXP = /^!s vote <@!?(\d+)>/i;
const SPY_COMMAND_REGEXP = /^!s spy (.+)$/i;
const BREAK_COMMAND_REGEXP = /^!s break (.+)$/i;
const MESSAGE_COMMAND_REGEXP = /^!s message (.+) (.+)$/i;
let previousMumble = null;
function handleMessage(message, allowMumble) {
    if (allowMumble && game_config_1.gameConfig.channel === message.channel && game_config_1.gameConfig.badoozledPlayers.some(m => !game_config_1.gameConfig.recentlyBadoozled.some(b => b != m) && m === message.author)) {
        message.delete();
        if (previousMumble)
            previousMumble.delete();
        game_config_1.getNickname(message.author)
            .then(n => {
            if (!game_config_1.gameConfig.channel)
                return;
            const flavour = rand_from_array_1.default(load_flavours_1.mumbleFlavours, 1)[0];
            game_config_1.gameConfig.channel.send(flavour(n, ''))
                .then(m => previousMumble = m);
        });
        return;
    }
    const content = message.content;
    if (!content.startsWith("!s")) {
        return;
    }
    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Received command : '${content}'`);
    const alivePeeps = game_config_1.gameConfig.allPlayers.filter(p => !game_config_1.gameConfig.badoozledPlayers.some(b => b === p));
    switch (content) {
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
        case "!s vote-nb":
            message.channel.send(`Available IDs are : ${alivePeeps.map((u, id) => `[${id}] ${u.username}`).join(", ")}`);
            ;
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
    const voteNumberData = VOTE_NUMBER_COMMAND_REGEXP.exec(content);
    if (voteNumberData) {
        const target = alivePeeps[+voteNumberData[1]];
        if (!target) {
            message.channel.send(`Error. Available IDs are : ${alivePeeps.map((u, id) => `[${id}] ${u.username}`).join(", ")}`);
            return;
        }
        vote_1.handleVote(message, target.username);
        return;
    }
    const voteIDData = VOTE_ID_COMMAND_REGEXP.exec(content);
    if (voteIDData) {
        let voteTarget = voteIDData[1];
        const member = game_config_1.gameConfig.allPlayers.filter(p => p.id === voteTarget)[0];
        if (!member) {
            message.channel.send("Could not find player with that ID.");
            return;
        }
        vote_1.handleVote(message, member.username);
        return;
    }
    const voteData = VOTE_COMMAND_REGEXP.exec(content);
    if (voteData) {
        vote_1.handleVote(message, voteData[1]);
        return;
    }
    const spyData = SPY_COMMAND_REGEXP.exec(content);
    if (spyData) {
        spy_1.handleSpy(message, spyData[1]);
        return;
    }
    const breakData = BREAK_COMMAND_REGEXP.exec(content);
    if (breakData) {
        deprogram_1.setBreak(message, breakData[1]);
        return;
    }
    const messageData = MESSAGE_COMMAND_REGEXP.exec(content);
    if (messageData) {
        try {
            switch (messageData[1]) {
                case "new-day":
                    {
                        const flavour = load_flavours_1.newDayFlavours[+(messageData[2])];
                        message.channel.send(flavour());
                    }
                    ;
                    return;
                case "no-enthrall":
                    {
                        const flavour = load_flavours_1.noEnthrallFlavours[+(messageData[2])];
                        message.channel.send(flavour());
                    }
                    ;
                    return;
                case "enthrall":
                    {
                        const flavour = load_flavours_1.enthrallFlavours[+(messageData[2])];
                        message.channel.send(flavour(message.author.username, message.author.username));
                    }
                    ;
                    return;
                case "start-vote":
                    {
                        const flavour = load_flavours_1.startVoteFlavours[+(messageData[2])];
                        message.channel.send(flavour());
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
                        const flavour = load_flavours_1.voteFlavours[+(messageData[2])];
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
    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Unknown command : '${content}'.`);
}
exports.handleMessage = handleMessage;
