import { handleDetective, DETECTIVE_ROLE, ATTRIBUTES } from "../../ts/roles/detective";
import { expect } from "chai";

// tslint:disable:no-unused-expression
describe("The detective role", () => {
    it("Should run properly to completion with no commands used (timeout)", async () => {
        const messages: string[] = [];
        const detective = { id: "0", roles: [ DETECTIVE_ROLE ], attributes: [], nickname: "0", username: "0" };
        const results = await handleDetective({}, 1)(
            {
                players: [ detective ],
                playerInterface: {
                    "0": { sendMessage: async (message) => { messages.push(message); } },
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
        );
        expect(results[detective.id]).to.not.be.undefined;
        expect(results[detective.id].command).to.equals("timeout");
        expect(detective.attributes).to.be.empty;
    });

    it("Should run properly to completion by skipping", async () => {
        const messages: string[] = [];
        const detective = { id: "0", roles: [ DETECTIVE_ROLE ], attributes: [], nickname: "0", username: "0" };
        const results = await handleDetective({}, 1)(
            {
                players: [ detective ],
                playerInterface: {
                    "0": { sendMessage: async (message) => { messages.push(message); } },
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
        );
        expect(results[detective.id]).to.not.be.undefined;
        expect(results[detective.id].command).to.equals("skip");
        expect(detective.attributes).to.be.empty;
    });

    it("Should run properly to completion by spying on somebody", async () => {
        const messages: string[] = [];
        const detective = { id: "0", roles: [ DETECTIVE_ROLE ], attributes: [], nickname: "0", username: "0" };
        const spiedOnPlayer = { id: "1", roles: [ ], attributes: [ ], nickname: "1", username: "1" };
        const results = await handleDetective({}, 1)(
            {
                players: [ detective, spiedOnPlayer ],
                playerInterface: {
                    "0": { sendMessage: async (message) => { messages.push(message); } },
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
        );
        expect(results[detective.id]).to.not.be.undefined;
        expect(results[detective.id].command).to.equals("spy");
        expect(spiedOnPlayer.attributes).not.to.be.empty;
        expect(spiedOnPlayer.attributes[0]).to.equals(ATTRIBUTES.SPIED);
    });
});
