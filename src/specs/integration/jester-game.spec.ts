import { runGame } from "./base";
import { expect } from "chai";
import { PREFIX } from "../../ts/client/command-handler";

describe("For games with a jester, the test environment", () => {
  it("Should play a normal 3 player game where jester wins + get broken on first day", async () => {
    const { replies, mumbles } = await runGame(
      3,
      [
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 3,
          private: true,
          original: `1p>${PREFIX} vote 3`,
        },
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 2,
          private: false,
          original: `1>${PREFIX} vote 2`,
        },
        {
          type: "target",
          command: "vote",
          player: 2,
          target: 2,
          private: false,
          original: `2>${PREFIX} vote 2`,
        },
      ],
      { tists: 1, jesters: 1 }
    );
    expect(replies.pop()).to.equals("general > Jester won !");
    expect(mumbles).to.equals(0);
  });

  it("Should play a normal 3 player game where tist wins + jester gets broken at night", async () => {
    const { replies, mumbles } = await runGame(
      3,
      [
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 2,
          private: true,
          original: `1p>${PREFIX} vote 2`,
        },
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 3,
          private: false,
          original: `1>${PREFIX} vote 3`,
        },
        {
          type: "target",
          command: "vote",
          player: 3,
          target: 3,
          private: false,
          original: `3>${PREFIX} vote 3`,
        },
      ],
      { tists: 1, jesters: 1 }
    );
    expect(replies.pop()).to.equals("general > Hypnotists won !");
    expect(mumbles).to.equals(0);
  });

  it("Should play a normal 3 player game where town wins + jester gets broken at night", async () => {
    const { replies, mumbles } = await runGame(
      3,
      [
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 2,
          private: true,
          original: `1p>${PREFIX} vote 2`,
        },
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 1,
          private: false,
          original: `1>${PREFIX} vote 1`,
        },
        {
          type: "target",
          command: "vote",
          player: 3,
          target: 1,
          private: false,
          original: `3>${PREFIX} vote 1`,
        },
      ],
      { tists: 1, jesters: 1 }
    );
    expect(replies.pop()).to.equals("general > Townspeople won !");
    expect(mumbles).to.equals(0);
  });
});
