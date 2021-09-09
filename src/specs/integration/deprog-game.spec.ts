import { runGame } from "./base";
import { expect } from "chai";
import { PREFIX } from "../../ts/client/command-handler";

describe("For games with a deprogrammer, the test environment", () => {
  it("Should play a normal 3 player game where town wins + deprog saves without errors", async () => {
    const { replies, mumbles } = await runGame(
      3,
      [
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 3,
          private: true,
          original: `1>${PREFIX} vote 3`,
        },
        {
          type: "target",
          command: "save",
          player: 2,
          target: 3,
          private: true,
          original: `2>${PREFIX} save 3`,
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
          target: 1,
          private: false,
          original: `2>${PREFIX} vote 1`,
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
      { tists: 1, deprogs: 1 }
    );
    expect(replies.pop()).to.equals("general > Townspeople won !");
    expect(mumbles).to.equals(0);
  });

  it("Should play a normal 3 player game where town wins + deprog breaks tist without errors", async () => {
    const { replies, mumbles } = await runGame(
      3,
      [
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 3,
          private: true,
          original: `1>${PREFIX} vote 3`,
        },
        {
          type: "target",
          command: "break",
          player: 2,
          target: 1,
          private: true,
          original: `2>${PREFIX} break 1`,
        },
      ],
      { tists: 1, deprogs: 1 }
    );
    expect(replies.pop()).to.equals("general > Townspeople won !");
    expect(mumbles).to.equals(0);
  });

  it("Should play a normal 3 player game where town wins + deprog skips without errors", async () => {
    const { replies, mumbles } = await runGame(
      3,
      [
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 3,
          private: true,
          original: `1>${PREFIX} vote 3`,
        },
        {
          type: "simple",
          command: "skip",
          player: 2,
          private: true,
          original: `2>${PREFIX} skip`,
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
          player: 2,
          target: 1,
          private: false,
          original: `2>${PREFIX} vote 1`,
        },
      ],
      { tists: 1, deprogs: 1 }
    );
    expect(replies.pop()).to.equals("general > Townspeople won !");
    expect(mumbles).to.equals(0);
  });

  it("Should play a game 3 player where the deprog saves but makes a typo", async () => {
    const { replies, mumbles } = await runGame(
      3,
      [
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 3,
          private: true,
          original: `1>${PREFIX} vote 2`,
        },
        {
          type: "target",
          command: "save",
          player: 2,
          target: 2,
          private: true,
          original: `2>${PREFIX} save 2`,
        },
        {
          type: "target",
          command: "save",
          player: 2,
          target: 3,
          private: true,
          original: `2>${PREFIX} save 3`,
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
          target: 1,
          private: false,
          original: `2>${PREFIX} vote 1`,
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
      { tists: 1, deprogs: 1 }
    );
    expect(replies.pop()).to.equals("general > Townspeople won !");
    expect(mumbles).to.equals(0);
  });

  it("Should play a 3 player game where the deprog saves but somebody else tries to skip deprog", async () => {
    const { replies, mumbles } = await runGame(
      3,
      [
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 3,
          private: true,
          original: `1>${PREFIX} vote 2`,
        },
        {
          type: "simple",
          command: "skip",
          player: 1,
          private: true,
          original: `1>${PREFIX} skip`,
        },
        {
          type: "target",
          command: "save",
          player: 2,
          target: 3,
          private: true,
          original: `2>${PREFIX} save 3`,
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
          target: 1,
          private: false,
          original: `2>${PREFIX} vote 1`,
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
      { tists: 1, deprogs: 1 }
    );
    expect(replies.pop()).to.equals("general > Townspeople won !");
    expect(mumbles).to.equals(0);
  });

  it("Should play a 3 player game where the deprog saves but then tries to skip deprog", async () => {
    const { replies, mumbles } = await runGame(
      3,
      [
        {
          type: "target",
          command: "vote",
          player: 1,
          target: 3,
          private: true,
          original: `1>${PREFIX} vote 2`,
        },
        {
          type: "target",
          command: "save",
          player: 2,
          target: 3,
          private: true,
          original: `2>${PREFIX} save 3`,
        },
        {
          type: "simple",
          command: "skip",
          player: 2,
          private: true,
          original: `1>${PREFIX} skip`,
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
          target: 1,
          private: false,
          original: `2>${PREFIX} vote 1`,
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
      { tists: 1, deprogs: 1 }
    );
    expect(replies.pop()).to.equals("general > Townspeople won !");
    expect(mumbles).to.equals(0);
  });

  it("Should play a 2 player game where the deprog breaks the tist and the tist breaks the deprog", async () => {
    const { replies, mumbles } = await runGame(
      2,
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
          command: "break",
          player: 2,
          target: 1,
          private: true,
          original: `2>${PREFIX} break 1`,
        },
      ],
      { tists: 1, deprogs: 1 }
    );
    expect(replies.pop()).to.equals("general > Nobody won !");
    expect(mumbles).to.equals(0);
  });
});
