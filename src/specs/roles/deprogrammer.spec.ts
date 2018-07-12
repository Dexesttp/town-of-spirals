import { handleDeprogrammer, DEPROGRAMMER_ROLE } from "../../ts/roles/deprogrammer";
import { BROKEN_NIGHT } from "../../ts/game/data/player-states";
import { expect } from "chai";

describe("The deprogrammer role", () => {
    it("Should run properly to completion with no commands used (timeout)", async () => {
        const results: string[] = [];
        await handleDeprogrammer(
            {
                players: [
                    { id: "0", roles: [ DEPROGRAMMER_ROLE ], attributes: [], nickname: "0", username: "0" },
                ],
                playerInterface: {
                    "0": { sendMessage: async (message) => { results.push(message); } },
                },
                sendMessage: async (message) => { /* */ },
            },
            {
                cleanSubscribedCommands: () => { /* NO OP */ },
                cleanSubscribedTargettingCommands: () => { /* NO OP */ },
                getCommandPromise: () => new Promise(() => { /* NO OP */ }),
                getTargettingCommandPromise: () => new Promise(() => { /* NO OP */ }),
                startVote: () => new Promise(() => { /* NO OP */ }),
            },
            1,
        );
        expect(results.length).to.equals(3);
    });

    it("Should run properly to completion by skipping", async () => {
        const results: string[] = [];
        await handleDeprogrammer(
            {
                players: [
                    { id: "0", roles: [ DEPROGRAMMER_ROLE ], attributes: [], nickname: "0", username: "0" },
                ],
                playerInterface: {
                    "0": { sendMessage: async (message) => { results.push(message); } },
                },
                sendMessage: async (message) => { /* */ },
            },
            {
                cleanSubscribedCommands: () => { /* NO OP */ },
                cleanSubscribedTargettingCommands: () => { /* NO OP */ },
                getCommandPromise: () => new Promise((res) => { res({ playerID: "0" }); }),
                getTargettingCommandPromise: () => new Promise(() => { /* NO OP */ }),
                startVote: () => new Promise(() => { /* NO OP */ }),
            },
            1,
        );
        expect(results.length).to.equals(3);
    });

    it("Should run properly to completion by saving somebody", async () => {
        const results: string[] = [];
        const savedPlayer = { id: "1", roles: [ ], attributes: [ BROKEN_NIGHT ], nickname: "1", username: "1" };
        await handleDeprogrammer(
            {
                players: [
                    { id: "0", roles: [ DEPROGRAMMER_ROLE ], attributes: [], nickname: "0", username: "0" },
                    savedPlayer,
                ],
                playerInterface: {
                    "0": { sendMessage: async (message) => { results.push(message); } },
                    "1": { sendMessage: async (message) => { /* */ } },
                },
                sendMessage: async (message) => { /* */ },
            },
            {
                cleanSubscribedCommands: () => { /* NO OP */ },
                cleanSubscribedTargettingCommands: () => { /* NO OP */ },
                getCommandPromise: () => new Promise(() => { /* NO OP */ }),
                getTargettingCommandPromise: (command) => {
                    if (command === "save") return new Promise((res) => { res({ playerID: "0", targetID: "1" }); });
                    return new Promise(() => { /* NO OP */ });
                },
                startVote: () => new Promise(() => { /* NO OP */ }),
            },
            1,
        );
        expect(results.length).to.equals(4);
        expect(savedPlayer.attributes.length).to.equals(0);
    });

    it("Should run properly to completion by breaking somebody", async () => {
        const results: string[] = [];
        const brokenPlayer = { id: "1", roles: [ ], attributes: [ ], nickname: "1", username: "1" };
        await handleDeprogrammer(
            {
                players: [
                    { id: "0", roles: [ DEPROGRAMMER_ROLE ], attributes: [], nickname: "0", username: "0" },
                    brokenPlayer,
                ],
                playerInterface: {
                    "0": { sendMessage: async (message) => { results.push(message); } },
                    "1": { sendMessage: async (message) => { /* */ } },
                },
                sendMessage: async (message) => { /* */ },
            },
            {
                cleanSubscribedCommands: () => { /* NO OP */ },
                cleanSubscribedTargettingCommands: () => { /* NO OP */ },
                getCommandPromise: () => new Promise(() => { /* NO OP */ }),
                getTargettingCommandPromise: (command) => {
                    if (command === "break") return new Promise((res) => { res({ playerID: "0", targetID: "1" }); });
                    return new Promise(() => { /* NO OP */ });
                },
                startVote: () => new Promise(() => { /* NO OP */ }),
            },
            1,
        );
        expect(results.length).to.equals(3);
        expect(brokenPlayer.attributes.length).to.equals(1);
    });
});
