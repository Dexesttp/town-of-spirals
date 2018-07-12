import { handleDetective, DETECTIVE_ROLE } from "../../ts/roles/detective";
import { expect } from "chai";

describe("The detective role", () => {
    it("Should run properly to completion with no commands used (timeout)", async () => {
        const results: string[] = [];
        await handleDetective(
            {
                players: [
                    { id: "0", roles: [ DETECTIVE_ROLE ], attributes: [], nickname: "0", username: "0" },
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
        await handleDetective(
            {
                players: [
                    { id: "0", roles: [ DETECTIVE_ROLE ], attributes: [], nickname: "0", username: "0" },
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

    it("Should run properly to completion by spying on somebody", async () => {
        const results: string[] = [];
        const spiedOnPlayer = { id: "1", roles: [ ], attributes: [ ], nickname: "1", username: "1" };
        await handleDetective(
            {
                players: [
                    { id: "0", roles: [ DETECTIVE_ROLE ], attributes: [], nickname: "0", username: "0" },
                    spiedOnPlayer,
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
                getTargettingCommandPromise: (command) => new Promise((res) => { res({ playerID: "0", targetID: "1" }); }),
                startVote: () => new Promise(() => { /* NO OP */ }),
            },
            1,
        );
        expect(results.length).to.equals(3, "Not the right number of messages");
        expect(spiedOnPlayer.attributes.length).to.equals(1);
    });
});
