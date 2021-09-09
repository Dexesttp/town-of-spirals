import { runGame } from "./base";
import { expect } from "chai";
import { PREFIX } from "../../ts/client/command-handler";

describe("For 4 player games, the test environment", () => {
  it("Should play a normal game where town wins without errors", async () => {
    const { replies, mumbles } = await runGame(
      4,
      [
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 2,
          private: true,
          original: `1>${PREFIX} vote 2`,
        },
        {
          type: "target",
          command: "vote",
          player: 3,
          target: 1,
          private: false,
          original: `3>${PREFIX} vote 1`,
        },
        {
          type: "target",
          command: "vote",
          player: 4,
          target: 1,
          private: false,
          original: `4>${PREFIX} vote 1`,
        },
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 3,
          private: false,
          original: `1>${PREFIX} vote 3`,
        },
      ],
      { tists: 1 }
    );
    expect(replies.pop()).to.equals("general > Townspeople won !");
    expect(mumbles).to.equals(0);
  });

  it("Should play a normal game where tist wins without errors", async () => {
    const { replies, mumbles } = await runGame(
      4,
      [
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 2,
          private: true,
          original: `1>${PREFIX} vote 2`,
        },
        {
          type: "target",
          command: "vote",
          player: 3,
          target: 4,
          private: false,
          original: `3>${PREFIX} vote 1`,
        },
        {
          type: "target",
          command: "vote",
          player: 4,
          target: 3,
          private: false,
          original: `4>${PREFIX} vote 1`,
        },
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 4,
          private: false,
          original: `1>${PREFIX} vote 3`,
        },
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 3,
          private: true,
          original: `1>${PREFIX} vote 2`,
        },
      ],
      { tists: 1 }
    );
    expect(replies.pop()).to.equals("general > Hypnotists won !");
    expect(mumbles).to.equals(0);
  });

  it("Should play a normal game where tist wins and someone skips a vote without errors", async () => {
    const { replies, mumbles } = await runGame(
      4,
      [
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 2,
          private: true,
          original: `1>${PREFIX} vote 2`,
        },
        {
          type: "target",
          command: "vote",
          player: 3,
          target: 4,
          private: false,
          original: `3>${PREFIX} vote 1`,
        },
        {
          type: "simple",
          command: "no-vote",
          player: 4,
          private: false,
          original: `4>${PREFIX} no-vote`,
        },
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 4,
          private: false,
          original: `1>${PREFIX} vote 3`,
        },
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 3,
          private: true,
          original: `1>${PREFIX} vote 2`,
        },
      ],
      { tists: 1 }
    );
    expect(replies.pop()).to.equals("general > Hypnotists won !");
    expect(mumbles).to.equals(0);
  });

  it("Should play a normal game where tist wins and a non-tist tries to vote without errors", async () => {
    const { replies, mumbles } = await runGame(
      4,
      [
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 2,
          private: true,
          original: `1>${PREFIX} vote 2`,
        },
        {
          type: "target",
          command: "vote",
          player: 4,
          target: 2,
          private: true,
          original: `4>${PREFIX} vote 2`,
        },
        {
          type: "target",
          command: "vote",
          player: 3,
          target: 4,
          private: false,
          original: `3>${PREFIX} vote 1`,
        },
        {
          type: "target",
          command: "vote",
          player: 4,
          target: 3,
          private: false,
          original: `4>${PREFIX} vote 1`,
        },
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 4,
          private: false,
          original: `1>${PREFIX} vote 3`,
        },
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 3,
          private: true,
          original: `1>${PREFIX} vote 2`,
        },
      ],
      { tists: 1 }
    );
    expect(replies.pop()).to.equals("general > Hypnotists won !");
    expect(mumbles).to.equals(0);
  });

  it("Should play a normal game where tist breaks themselves without errors", async () => {
    const { replies, mumbles } = await runGame(
      4,
      [
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 1,
          private: true,
          original: `1>${PREFIX} vote 1`,
        },
      ],
      { tists: 1 }
    );
    expect(replies.pop()).to.equals("general > Townspeople won !");
    expect(mumbles).to.equals(0);
  });
});
