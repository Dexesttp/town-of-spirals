import * as moment from "moment";
import * as readline from "readline";
import { ClientMessage, Message } from "./type";

let COMMAND_PREFIX = () => `[${moment().format("HH:mm:ss")}] `;
let AUTHOR_MATCHER = /^(\d+)(p?)>(.+)?$/i;

export function GetClient() {
    const messageHandler: Array<(message: ClientMessage<string>) => void> = [];
    let getCommands: () => string[] = () => [];

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        completer(line: string) {
            const match = AUTHOR_MATCHER.exec(line);
            if (match) {
                const [, author, mode, command, text] = match;
                const hits = getCommands().filter(c => (`!s ${c}`).startsWith(command));
                return [hits.length
                    ? hits.map(c => `${author}${mode}>!s ${c}${text || ""}`)
                    : getCommands().map(c => `${author}${mode}>!s ${c}${text || ""}`),
                    line,
                ];
            }
            return [getCommands(), line];
        },
    });

    const questionHandler = (message: string) => {
        if (message === ".exit") {
            rl.close();
            return;
        }
        if (message === ".cls") {
            process.stdout.write(`\u001B[2J\u001B[0;0f`);
            rl.question(COMMAND_PREFIX(), questionHandler);
            return;
        }
        const match = AUTHOR_MATCHER.exec(message);
        if (!match) {
            rl.question(COMMAND_PREFIX(), questionHandler);
            return;
        }
        const [, author, mode, text] = match;
        Promise.all(
            messageHandler.map(h => h({
                author,
                content: text,
                private: !!mode,
                original: message,
            })),
        ).then(() => {
            rl.question(COMMAND_PREFIX(), questionHandler);
        }).catch(e => {
            console.error("Error : ", e);
            rl.question(COMMAND_PREFIX(), questionHandler);
        });
    };
    rl.question(COMMAND_PREFIX(), questionHandler);

    return {
        onMessageReceived(handler: (message: ClientMessage<string>) => void) {
            messageHandler.push(handler);
        },
        send(message: string) {
            rl.write(`${message}\n`);
        },
        sendTo(author: string, message: string) {
            rl.write(`${author}>${message}\n`);
        },
        setCommandGetter(getter: () => string[]) {
            getCommands = getter;
        },
        async tryDeleteMessage(message: Message, timeout?: number) {
            return false;
        },
    };
}
