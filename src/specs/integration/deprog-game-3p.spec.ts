import { runGame } from "./base";
import { expect } from "chai";

describe("For 3 player games with a deprogrammer, the test environment", () => {
    it("Should play a normal game where town wins + deprog saves without errors", async () => {
        const { replies, mumbles } = await runGame(
            3,
            [
                { type: "target", command: "vote", player: 1, target: 3, private: true, original: "1>!s vote 3" },
                { type: "target", command: "save", player: 2, target: 3, private: true, original: "2>!s save 3" },
                { type: "target", command: "vote", player: 1, target: 2, private: false, original: "1>!s vote 2" },
                { type: "target", command: "vote", player: 2, target: 1, private: false, original: "2>!s vote 1" },
                { type: "target", command: "vote", player: 3, target: 1, private: false, original: "3>!s vote 1" },
            ],
            { tists: 1, deprogs: 1 },
        );
        expect(replies.pop()).to.equals("general > Townspeople won !");
        expect(mumbles).to.equals(0);
    });

    it("Should play a normal game where town wins + deprog breaks tist without errors", async () => {
        const { replies, mumbles } = await runGame(
            3,
            [
                { type: "target", command: "vote", player: 1, target: 3, private: true, original: "1>!s vote 3" },
                { type: "target", command: "break", player: 2, target: 1, private: true, original: "2>!s break 1" },
            ],
            { tists: 1, deprogs: 1 },
        );
        expect(replies.pop()).to.equals("general > Townspeople won !");
        expect(mumbles).to.equals(0);
    });

    it("Should play a normal game where town wins + deprog skips without errors", async () => {
        const { replies, mumbles } = await runGame(
            3,
            [
                { type: "target", command: "vote", player: 1, target: 3, private: true, original: "1>!s vote 3" },
                { type: "simple", command: "skip", player: 2, private: true, original: "2>!s skip" },
                { type: "target", command: "vote", player: 1, target: 1, private: false, original: "1>!s vote 1" },
                { type: "target", command: "vote", player: 2, target: 1, private: false, original: "2>!s vote 1" },
            ],
            { tists: 1, deprogs: 1 },
        );
        expect(replies.pop()).to.equals("general > Townspeople won !");
        expect(mumbles).to.equals(0);
    });

    it("Should play a game where the deprog saves but makes a typo", async () => {
        const { replies, mumbles } = await runGame(
            3,
            [
                { type: "target", command: "vote", player: 1, target: 3, private: true, original: "1>!s vote 2" },
                { type: "target", command: "save", player: 2, target: 2, private: true, original: "2>!s save 2" },
                { type: "target", command: "save", player: 2, target: 3, private: true, original: "2>!s save 3" },
                { type: "target", command: "vote", player: 1, target: 2, private: false, original: "1>!s vote 2" },
                { type: "target", command: "vote", player: 2, target: 1, private: false, original: "2>!s vote 1" },
                { type: "target", command: "vote", player: 3, target: 1, private: false, original: "3>!s vote 1" },
            ],
            { tists: 1, deprogs: 1 },
        );
        expect(replies.pop()).to.equals("general > Townspeople won !");
        expect(mumbles).to.equals(0);
    });

    it("Should play a game where the deprog saves but somebody else tries to skip deprog", async () => {
        const { replies, mumbles } = await runGame(
            3,
            [
                { type: "target", command: "vote", player: 1, target: 3, private: true, original: "1>!s vote 2" },
                { type: "simple", command: "skip", player: 1, private: true, original: "1>!s skip" },
                { type: "target", command: "save", player: 2, target: 3, private: true, original: "2>!s save 3" },
                { type: "target", command: "vote", player: 1, target: 2, private: false, original: "1>!s vote 2" },
                { type: "target", command: "vote", player: 2, target: 1, private: false, original: "2>!s vote 1" },
                { type: "target", command: "vote", player: 3, target: 1, private: false, original: "3>!s vote 1" },
            ],
            { tists: 1, deprogs: 1 },
        );
        expect(replies.pop()).to.equals("general > Townspeople won !");
        expect(mumbles).to.equals(0);
    });

    it("Should play a game where the deprog saves but then tries to skip deprog", async () => {
        const { replies, mumbles } = await runGame(
            3,
            [
                { type: "target", command: "vote", player: 1, target: 3, private: true, original: "1>!s vote 2" },
                { type: "target", command: "save", player: 2, target: 3, private: true, original: "2>!s save 3" },
                { type: "simple", command: "skip", player: 2, private: true, original: "1>!s skip" },
                { type: "target", command: "vote", player: 1, target: 2, private: false, original: "1>!s vote 2" },
                { type: "target", command: "vote", player: 2, target: 1, private: false, original: "2>!s vote 1" },
                { type: "target", command: "vote", player: 3, target: 1, private: false, original: "3>!s vote 1" },
            ],
            { tists: 1, deprogs: 1 },
        );
        expect(replies.pop()).to.equals("general > Townspeople won !");
        expect(mumbles).to.equals(0);
    });
});
