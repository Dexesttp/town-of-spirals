import { runGame } from "./base";
import { expect } from "chai";

describe("For 4 player games, the test environment", () => {
    it("Should play a normal game where town wins without errors", async () => {
        const { replies, mumbles } = await runGame(
            4,
            [
                { type: "target", command: "vote", player: 1, target: 2, private: true, original: "1>!s vote 2" },
                { type: "target", command: "vote", player: 3, target: 1, private: false, original: "3>!s vote 1" },
                { type: "target", command: "vote", player: 4, target: 1, private: false, original: "4>!s vote 1" },
                { type: "target", command: "vote", player: 1, target: 3, private: false, original: "1>!s vote 3" },
            ],
            { tists: 1 },
        );
        expect(replies.pop()).to.equals("Townspeople won !");
        expect(mumbles).to.equals(0);
    });

    it("Should play a normal game where tist wins without errors", async () => {
        const { replies, mumbles } = await runGame(
            4,
            [
                { type: "target", command: "vote", player: 1, target: 2, private: true, original: "1>!s vote 2" },
                { type: "target", command: "vote", player: 3, target: 4, private: false, original: "3>!s vote 1" },
                { type: "target", command: "vote", player: 4, target: 3, private: false, original: "4>!s vote 1" },
                { type: "target", command: "vote", player: 1, target: 4, private: false, original: "1>!s vote 3" },
                { type: "target", command: "vote", player: 1, target: 3, private: true, original: "1>!s vote 2" },
            ],
            { tists: 1 },
        );
        expect(replies.pop()).to.equals("Hypnotists won !");
        expect(mumbles).to.equals(0);
    });

    it("Should play a normal game where tist wins and someone skips a vote without errors", async () => {
        const { replies, mumbles } = await runGame(
            4,
            [
                { type: "target", command: "vote", player: 1, target: 2, private: true, original: "1>!s vote 2" },
                { type: "target", command: "vote", player: 3, target: 4, private: false, original: "3>!s vote 1" },
                { type: "simple", command: "no-vote", player: 4, private: false, original: "4>!s no-vote" },
                { type: "target", command: "vote", player: 1, target: 4, private: false, original: "1>!s vote 3" },
                { type: "target", command: "vote", player: 1, target: 3, private: true, original: "1>!s vote 2" },
            ],
            { tists: 1 },
        );
        expect(replies.pop()).to.equals("Hypnotists won !");
        expect(mumbles).to.equals(0);
    });

    it("Should play a normal game where tist wins and a non-tist tries to vote without errors", async () => {
        const { replies, mumbles } = await runGame(
            4,
            [
                { type: "target", command: "vote", player: 1, target: 2, private: true, original: "1>!s vote 2" },
                { type: "target", command: "vote", player: 4, target: 2, private: true, original: "4>!s vote 2" },
                { type: "target", command: "vote", player: 3, target: 4, private: false, original: "3>!s vote 1" },
                { type: "target", command: "vote", player: 4, target: 3, private: false, original: "4>!s vote 1" },
                { type: "target", command: "vote", player: 1, target: 4, private: false, original: "1>!s vote 3" },
                { type: "target", command: "vote", player: 1, target: 3, private: true, original: "1>!s vote 2" },
            ],
            { tists: 1 },
        );
        expect(replies.pop()).to.equals("Hypnotists won !");
        expect(mumbles).to.equals(0);
    });
});
