import { runGame } from "./base";
import { expect } from "chai";

describe("For 3 player games with a detective, the test environment", () => {
    it("Should play a normal game where town wins + detective skips without errors", async () => {
        const { replies, mumbles } = await runGame(
            3,
            [
                { type: "target", command: "vote", player: 1, target: 3, private: true, original: "1>!s vote 2" },
                { type: "simple", command: "skip", player: 2, private: true, original: "2>!s skip" },
                { type: "target", command: "vote", player: 1, target: 1, private: false, original: "1>!s vote 1" },
                { type: "target", command: "vote", player: 2, target: 1, private: false, original: "3>!s vote 1" },
            ],
            { tists: 1, detectives: 1 },
        );
        expect(replies.pop()).to.equals("general > Townspeople won !");
        expect(mumbles).to.equals(0);
    });

    it("Should play a normal game where town wins + detective spies tist without errors", async () => {
        const { replies, mumbles } = await runGame(
            3,
            [
                { type: "target", command: "vote", player: 1, target: 3, private: true, original: "1>!s vote 2" },
                { type: "target", command: "spy", player: 2, target: 1, private: true, original: "2>!s spy 1" },
                { type: "target", command: "vote", player: 1, target: 1, private: false, original: "1>!s vote 1" },
                { type: "target", command: "vote", player: 2, target: 1, private: false, original: "3>!s vote 1" },
            ],
            { tists: 1, detectives: 1 },
        );
        expect(replies.pop()).to.equals("general > Townspeople won !");
        expect(mumbles).to.equals(0);
    });

    it("Should play a normal game where town wins + somebody tries to spy without errors", async () => {
        const { replies, mumbles } = await runGame(
            3,
            [
                { type: "target", command: "vote", player: 1, target: 3, private: true, original: "1>!s vote 2" },
                { type: "target", command: "spy", player: 1, target: 2, private: true, original: "1>!s spy 2" },
                { type: "target", command: "spy", player: 2, target: 1, private: true, original: "2>!s spy 1" },
                { type: "target", command: "vote", player: 1, target: 1, private: false, original: "1>!s vote 1" },
                { type: "target", command: "vote", player: 2, target: 1, private: false, original: "3>!s vote 1" },
            ],
            { tists: 1, detectives: 1 },
        );
        expect(replies.pop()).to.equals("general > Townspeople won !");
        expect(mumbles).to.equals(0);
    });


});
