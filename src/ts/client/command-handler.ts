import * as moment from "moment";
import { ClientMessage } from "./type";

let COMMAND_MATCHER = /^!s ([^\s]+) ?(.*)$/i;

export function GetCommandHandler<T>(
    send: (message: ClientMessage<T>, text: string) => void,
    logCommands?: boolean,
) {
    let before: Array<(message: ClientMessage<T>) => Promise<boolean>> = [];
    let handlers: Array<{
        command: string,
        handler: (message: ClientMessage<T>, messageContent: string) => Promise<boolean>,
    }> = [];

    return {
        /**
         * Get the list of subscribed commands.
         */
        commands() { return handlers.map(h => h.command); },

        /**
         * Handles a message
         */
        async messageHandler(message: ClientMessage<T>) {
            for (let beforeHandler of before) {
                const result = await beforeHandler(message);
                if (result) return;
            }
            const match = COMMAND_MATCHER.exec(message.content);
            if (!match)
                return;
            const [, command, text] = match;
            if (logCommands) {
                // tslint:disable-next-line:max-line-length
                console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Received command : '${command}' by '${message.author}'${message.private ? " (private)" : ""}`);
            }
            for (let handler of handlers) {
                if (handler.command !== command)
                    continue;
                const result = await handler.handler(message, text);
                if (result)
                    return;
            }
            const m = await send(message, `Unknown command : ${command}`);
            return;
        },

        /**
         * Set a handler for before the message is sent.
         * @param handler The before handler, should return true to block the message from being propagated.
         */
        onBefore(handler: (message: ClientMessage<T>) => Promise<boolean>) {
            before.push(handler);
            return () => {
                before = before.filter(h => h !== handler);
            };
        },

        /**
         * Add a command handler to the given command. Returns an unsubscriber for the command.
         * @param command the command to match against
         * @param handler The command handler, should return true to block the message from being propagated.
         */
        on(command: string, handler: (message: ClientMessage<T>, commandContent: string) => Promise<boolean>) {
            handlers.push({ command, handler });
            return () => {
                handlers = handlers.filter(h => h.command !== command || h.handler !== handler);
            };
        },
    };
}
