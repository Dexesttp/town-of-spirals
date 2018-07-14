import {
    DEPROGRAMMER_HAS_BROKEN_ATTRIBUTE,
    DEPROGRAMMER_HAS_SAVED_ATTRIBUTE,
    DEPROGRAMMER_ROLE,
    DEPROGRAMMER_SAVED_ATTRIBUTE,
    handleDeprogrammer,
} from "../../ts/roles/deprogrammer";
import { BROKEN_NIGHT } from "../../ts/game/data/player-states";
import { expect } from "chai";

// tslint:disable:no-unused-expression
describe("The deprogrammer role", () => {
    it("Should run properly to completion with no commands used (timeout)", async () => {
        const messages: string[] = [];
        const deprog = { id: "0", roles: [ DEPROGRAMMER_ROLE ], attributes: [], nickname: "0", username: "0" };
        const results = await handleDeprogrammer(
            {
                players: [ deprog ],
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
            1,
        );
        expect(results[deprog.id]).to.not.be.undefined;
        expect(results[deprog.id].command).to.equals("timeout");
        expect(deprog.attributes).to.be.empty;
    });

    it("Should run properly to completion by skipping", async () => {
        const messages: string[] = [];
        const deprog = { id: "0", roles: [ DEPROGRAMMER_ROLE ], attributes: [], nickname: "0", username: "0" };
        const results = await handleDeprogrammer(
            {
                players: [ deprog ],
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
            1,
        );
        expect(results[deprog.id]).to.not.be.undefined;
        expect(results[deprog.id].command).to.equals("skip");
        expect(deprog.attributes).to.be.empty;
    });

    it("Should run properly to completion by saving somebody", async () => {
        const messages: string[] = [];
        const deprog = { id: "0", roles: [ DEPROGRAMMER_ROLE ], attributes: [], nickname: "0", username: "0" };
        const savedPlayer = { id: "1", roles: [ ], attributes: [ BROKEN_NIGHT ], nickname: "1", username: "1" };
        const results = await handleDeprogrammer(
            {
                players: [ deprog, savedPlayer ],
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
                getTargettingCommandPromise: (command) => {
                    if (command === "save") return new Promise((res) => { res({ playerID: "0", targetID: "1" }); });
                    return new Promise(() => { /* NO OP */ });
                },
                startVote: () => new Promise(() => { /* NO OP */ }),
            },
            1,
        );
        expect(results[deprog.id]).to.not.be.undefined;
        expect(results[deprog.id].command).to.equals("save");
        expect(savedPlayer.attributes).not.to.be.empty;
        expect(savedPlayer.attributes[0]).to.equals(DEPROGRAMMER_SAVED_ATTRIBUTE);
        expect(deprog.attributes).not.to.be.empty;
        expect(deprog.attributes[0]).to.equals(DEPROGRAMMER_HAS_SAVED_ATTRIBUTE);
    });

    it("Should run properly to completion by breaking somebody", async () => {
        const messages: string[] = [];
        const deprog = { id: "0", roles: [ DEPROGRAMMER_ROLE ], attributes: [], nickname: "0", username: "0" };
        const healthyPlayer = { id: "1", roles: [ ], attributes: [ ], nickname: "1", username: "1" };
        const results = await handleDeprogrammer(
            {
                players: [ deprog, healthyPlayer ],
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
                getTargettingCommandPromise: (command) => {
                    if (command === "break") return new Promise((res) => { res({ playerID: "0", targetID: "1" }); });
                    return new Promise(() => { /* NO OP */ });
                },
                startVote: () => new Promise(() => { /* NO OP */ }),
            },
            1,
        );
        expect(results[deprog.id]).to.not.be.undefined;
        expect(results[deprog.id].command).to.equals("break");
        expect(healthyPlayer.attributes).not.to.be.empty;
        expect(healthyPlayer.attributes[0]).to.equals(BROKEN_NIGHT);
        expect(deprog.attributes).not.to.be.empty;
        expect(deprog.attributes[0]).to.equals(DEPROGRAMMER_HAS_BROKEN_ATTRIBUTE);
    });
});
