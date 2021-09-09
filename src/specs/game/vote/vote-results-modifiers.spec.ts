import { expect } from "chai";
import { VoteResultType } from "../../../ts/game/vote/types";
import { GetVoteFactory } from "./get-vote-factory";

describe("The Vote engine, when using modifiers", () => {
  it("Should rig a single user voting as an unanime vote", async () => {
    const startVote = GetVoteFactory([
      { voterID: "test_vote1", targetID: "test_target1" },
    ]);
    const result = await startVote({
      voters: [
        {
          id: "test_vote1",
          attributes: [],
          roles: [],
          nickname: "Test Voter 1",
          username: "",
        },
      ],
      targets: [
        {
          id: "test_target1",
          attributes: [],
          roles: [],
          nickname: "Test Target 1",
          username: "",
        },
        {
          id: "test_target2",
          attributes: [],
          roles: [],
          nickname: "Test Target 2",
          username: "",
        },
      ],
      rig: () => [{ voter: "test_vote1", target: "test_target2" }],
    });
    expect(result).to.have.deep.property("type", VoteResultType.UNANIMITY);
    expect(result).to.have.deep.property("target", "test_target2");
    expect(result).to.have.deep.property("timedout", []);
  });

  it("Should rig three voters for an unanime vote", async () => {
    const startVote = GetVoteFactory([
      { voterID: "test_vote1", targetID: "test_target1" },
      { voterID: "test_vote2", targetID: "test_target1" },
      { voterID: "test_vote3", targetID: "test_target1" },
    ]);
    const result = await startVote({
      voters: [
        {
          id: "test_vote1",
          attributes: [],
          roles: [],
          nickname: "Test Voter 1",
          username: "",
        },
        {
          id: "test_vote2",
          attributes: [],
          roles: [],
          nickname: "Test Voter 2",
          username: "",
        },
        {
          id: "test_vote3",
          attributes: [],
          roles: [],
          nickname: "Test Voter 3",
          username: "",
        },
      ],
      targets: [
        {
          id: "test_target1",
          attributes: [],
          roles: [],
          nickname: "Test Target 1",
          username: "",
        },
        {
          id: "test_target2",
          attributes: [],
          roles: [],
          nickname: "Test Target 2",
          username: "",
        },
      ],
      rig: () => [
        { voter: "test_vote1", target: "test_target2" },
        { voter: "test_vote2", target: "test_target2" },
        { voter: "test_vote3", target: "test_target2" },
      ],
    });
    expect(result).to.have.deep.property("type", VoteResultType.UNANIMITY);
    expect(result).to.have.deep.property("target", "test_target2");
    expect(result).to.have.deep.property("timedout", []);
  });

  it("Should partially rig three voters for a majority vote", async () => {
    const startVote = GetVoteFactory([
      { voterID: "test_vote1", targetID: "test_target1" },
      { voterID: "test_vote2", targetID: "test_target1" },
      { voterID: "test_vote3", targetID: "test_target1" },
    ]);
    const result = await startVote({
      voters: [
        {
          id: "test_vote1",
          attributes: [],
          roles: [],
          nickname: "Test Voter 1",
          username: "",
        },
        {
          id: "test_vote2",
          attributes: [],
          roles: [],
          nickname: "Test Voter 2",
          username: "",
        },
        {
          id: "test_vote3",
          attributes: [],
          roles: [],
          nickname: "Test Voter 3",
          username: "",
        },
      ],
      targets: [
        {
          id: "test_target1",
          attributes: [],
          roles: [],
          nickname: "Test Target 1",
          username: "",
        },
        {
          id: "test_target2",
          attributes: [],
          roles: [],
          nickname: "Test Target 2",
          username: "",
        },
      ],
      rig: () => [{ voter: "test_vote1", target: "test_target2" }],
    });
    expect(result).to.have.deep.property("type", VoteResultType.MAJORITY);
    expect(result).to.have.deep.property("target", "test_target1");
    expect(result).to.have.deep.property("timedout", []);
  });

  it("Should rig three voters for a majority vote when there's a timeout", async () => {
    const startVote = GetVoteFactory([
      { voterID: "test_vote1", targetID: "test_target1" },
    ]);
    const result = await startVote({
      voters: [
        {
          id: "test_vote1",
          attributes: [],
          roles: [],
          nickname: "Test Voter 1",
          username: "",
        },
        {
          id: "test_vote2",
          attributes: [],
          roles: [],
          nickname: "Test Voter 2",
          username: "",
        },
        {
          id: "test_vote3",
          attributes: [],
          roles: [],
          nickname: "Test Voter 3",
          username: "",
        },
      ],
      targets: [
        {
          id: "test_target1",
          attributes: [],
          roles: [],
          nickname: "Test Target 1",
          username: "",
        },
        {
          id: "test_target2",
          attributes: [],
          roles: [],
          nickname: "Test Target 2",
          username: "",
        },
      ],
      rig: () => [{ voter: "test_vote1", target: "test_target2" }],
    });
    expect(result).to.have.deep.property("type", VoteResultType.MAJORITY);
    expect(result).to.have.deep.property("target", "test_target2");
    expect(result).to.have.deep.property("timedout", [
      "test_vote2",
      "test_vote3",
    ]);
  });

  it("Should rig three voters for an unanime vote for no-vote", async () => {
    const startVote = GetVoteFactory([
      { voterID: "test_vote1", targetID: "test_target1" },
      { voterID: "test_vote2", targetID: "test_target1" },
      { voterID: "test_vote3", targetID: "test_target1" },
    ]);
    const result = await startVote({
      voters: [
        {
          id: "test_vote1",
          attributes: [],
          roles: [],
          nickname: "Test Voter 1",
          username: "",
        },
        {
          id: "test_vote2",
          attributes: [],
          roles: [],
          nickname: "Test Voter 2",
          username: "",
        },
        {
          id: "test_vote3",
          attributes: [],
          roles: [],
          nickname: "Test Voter 3",
          username: "",
        },
      ],
      targets: [
        {
          id: "test_target1",
          attributes: [],
          roles: [],
          nickname: "Test Target 1",
          username: "",
        },
        {
          id: "test_target2",
          attributes: [],
          roles: [],
          nickname: "Test Target 2",
          username: "",
        },
      ],
      rig: () => [
        { voter: "test_vote1", target: null },
        { voter: "test_vote2", target: null },
        { voter: "test_vote3", target: null },
      ],
    });
    expect(result).to.have.deep.property(
      "type",
      VoteResultType.UNANIMITY_NO_VOTE
    );
    expect(result).to.have.deep.property("timedout", []);
  });

  it("Should rig three voters as a majority vote for no-vote", async () => {
    const startVote = GetVoteFactory([
      { voterID: "test_vote1", targetID: "test_target1" },
      { voterID: "test_vote2", targetID: "test_target1" },
      { voterID: "test_vote3", targetID: "test_target1" },
    ]);
    const result = await startVote({
      voters: [
        {
          id: "test_vote1",
          attributes: [],
          roles: [],
          nickname: "Test Voter 1",
          username: "",
        },
        {
          id: "test_vote2",
          attributes: [],
          roles: [],
          nickname: "Test Voter 2",
          username: "",
        },
        {
          id: "test_vote3",
          attributes: [],
          roles: [],
          nickname: "Test Voter 3",
          username: "",
        },
      ],
      targets: [
        {
          id: "test_target1",
          attributes: [],
          roles: [],
          nickname: "Test Target 1",
          username: "",
        },
        {
          id: "test_target2",
          attributes: [],
          roles: [],
          nickname: "Test Target 2",
          username: "",
        },
      ],
      rig: () => [
        { voter: "test_vote1", target: null },
        { voter: "test_vote2", target: null },
      ],
    });
    expect(result).to.have.deep.property(
      "type",
      VoteResultType.MAJORITY_NO_VOTE
    );
    expect(result).to.have.deep.property("timedout", []);
  });

  it("Should rig three voters as a majority vote for no-vote when there's a timeout", async () => {
    const startVote = GetVoteFactory([
      { voterID: "test_vote1", targetID: "test_target1" },
    ]);
    const result = await startVote({
      voters: [
        {
          id: "test_vote1",
          attributes: [],
          roles: [],
          nickname: "Test Voter 1",
          username: "",
        },
        {
          id: "test_vote2",
          attributes: [],
          roles: [],
          nickname: "Test Voter 2",
          username: "",
        },
        {
          id: "test_vote3",
          attributes: [],
          roles: [],
          nickname: "Test Voter 3",
          username: "",
        },
      ],
      targets: [
        {
          id: "test_target1",
          attributes: [],
          roles: [],
          nickname: "Test Target 1",
          username: "",
        },
        {
          id: "test_target2",
          attributes: [],
          roles: [],
          nickname: "Test Target 2",
          username: "",
        },
      ],
      rig: () => [{ voter: "test_vote1", target: null }],
    });
    expect(result).to.have.deep.property(
      "type",
      VoteResultType.MAJORITY_NO_VOTE
    );
    expect(result).to.have.deep.property("timedout", [
      "test_vote2",
      "test_vote3",
    ]);
  });

  it("Should rig two voters for a tie", async () => {
    const startVote = GetVoteFactory([
      { voterID: "test_vote1", targetID: "test_target1" },
      { voterID: "test_vote2", targetID: "test_target1" },
    ]);
    const result = await startVote({
      voters: [
        {
          id: "test_vote1",
          attributes: [],
          roles: [],
          nickname: "Test Voter 1",
          username: "",
        },
        {
          id: "test_vote2",
          attributes: [],
          roles: [],
          nickname: "Test Voter 2",
          username: "",
        },
      ],
      targets: [
        {
          id: "test_target1",
          attributes: [],
          roles: [],
          nickname: "Test Target 1",
          username: "",
        },
        {
          id: "test_target2",
          attributes: [],
          roles: [],
          nickname: "Test Target 2",
          username: "",
        },
      ],
      rig: () => [{ voter: "test_vote1", target: "test_target2" }],
    });
    expect(result).to.have.deep.property("type", VoteResultType.TIE);
    expect(result).to.have.deep.property("targets", [
      "test_target2",
      "test_target1",
    ]);
    expect(result).to.have.deep.property("timedout", []);
  });

  it("Should rig two voters for a tie with a no-vote", async () => {
    const startVote = GetVoteFactory([
      { voterID: "test_vote1", targetID: "test_target1" },
      { voterID: "test_vote2", targetID: "test_target1" },
    ]);
    const result = await startVote({
      voters: [
        {
          id: "test_vote1",
          attributes: [],
          roles: [],
          nickname: "Test Voter 1",
          username: "",
        },
        {
          id: "test_vote2",
          attributes: [],
          roles: [],
          nickname: "Test Voter 2",
          username: "",
        },
      ],
      targets: [
        {
          id: "test_target1",
          attributes: [],
          roles: [],
          nickname: "Test Target 1",
          username: "",
        },
        {
          id: "test_target2",
          attributes: [],
          roles: [],
          nickname: "Test Target 2",
          username: "",
        },
      ],
      rig: () => [{ voter: "test_vote1", target: null }],
    });
    expect(result).to.have.deep.property("type", VoteResultType.TIE);
    expect(result).to.have.deep.property("targets", [null, "test_target1"]);
    expect(result).to.have.deep.property("timedout", []);
  });

  it("Should rig three voters for a tie in case of timeout", async () => {
    const startVote = GetVoteFactory([
      { voterID: "test_vote1", targetID: "test_target1" },
      { voterID: "test_vote2", targetID: "test_target1" },
    ]);
    const result = await startVote({
      voters: [
        {
          id: "test_vote1",
          attributes: [],
          roles: [],
          nickname: "Test Voter 1",
          username: "",
        },
        {
          id: "test_vote2",
          attributes: [],
          roles: [],
          nickname: "Test Voter 2",
          username: "",
        },
        {
          id: "test_vote3",
          attributes: [],
          roles: [],
          nickname: "Test Voter 3",
          username: "",
        },
      ],
      targets: [
        {
          id: "test_target1",
          attributes: [],
          roles: [],
          nickname: "Test Target 1",
          username: "",
        },
        {
          id: "test_target2",
          attributes: [],
          roles: [],
          nickname: "Test Target 2",
          username: "",
        },
      ],
      rig: () => [{ voter: "test_vote2", target: "test_target2" }],
    });
    expect(result).to.have.deep.property("type", VoteResultType.TIE);
    expect(result).to.have.deep.property("targets", [
      "test_target1",
      "test_target2",
    ]);
    expect(result).to.have.deep.property("timedout", ["test_vote3"]);
  });

  it("Should rig three voters for a tie with a no-vote in case of timeout", async () => {
    const startVote = GetVoteFactory([
      { voterID: "test_vote1", targetID: "test_target2" },
      { voterID: "test_vote2", targetID: "test_target2" },
    ]);
    const result = await startVote({
      voters: [
        {
          id: "test_vote1",
          attributes: [],
          roles: [],
          nickname: "Test Voter 1",
          username: "",
        },
        {
          id: "test_vote2",
          attributes: [],
          roles: [],
          nickname: "Test Voter 2",
          username: "",
        },
        {
          id: "test_vote3",
          attributes: [],
          roles: [],
          nickname: "Test Voter 3",
          username: "",
        },
      ],
      targets: [
        {
          id: "test_target1",
          attributes: [],
          roles: [],
          nickname: "Test Target 1",
          username: "",
        },
        {
          id: "test_target2",
          attributes: [],
          roles: [],
          nickname: "Test Target 2",
          username: "",
        },
      ],
      rig: () => [{ voter: "test_vote1", target: null }],
    });
    expect(result).to.have.deep.property("type", VoteResultType.TIE);
    expect(result).to.have.deep.property("targets", [null, "test_target2"]);
    expect(result).to.have.deep.property("timedout", ["test_vote3"]);
  });

  it("Should leave alone a single voter tie if nobody answered", async () => {
    const startVote = GetVoteFactory([]);
    const result = await startVote({
      voters: [
        {
          id: "test_vote1",
          attributes: [],
          roles: [],
          nickname: "Test Voter 1",
          username: "",
        },
      ],
      targets: [
        {
          id: "test_target1",
          attributes: [],
          roles: [],
          nickname: "Test Target 1",
          username: "",
        },
        {
          id: "test_target2",
          attributes: [],
          roles: [],
          nickname: "Test Target 2",
          username: "",
        },
      ],
      rig: () => [{ voter: "test_vote1", target: "test_target1" }],
    });
    expect(result).to.have.deep.property("type", VoteResultType.TIE);
    expect(result).to.have.deep.property("targets", [
      "test_target1",
      "test_target2",
    ]);
    expect(result).to.have.deep.property("timedout", ["test_vote1"]);
  });

  it("Should leave alone a three voter tie if nobody answered", async () => {
    const startVote = GetVoteFactory([]);
    const result = await startVote({
      voters: [
        {
          id: "test_vote1",
          attributes: [],
          roles: [],
          nickname: "Test Voter 1",
          username: "",
        },
        {
          id: "test_vote2",
          attributes: [],
          roles: [],
          nickname: "Test Voter 2",
          username: "",
        },
        {
          id: "test_vote3",
          attributes: [],
          roles: [],
          nickname: "Test Voter 3",
          username: "",
        },
      ],
      targets: [
        {
          id: "test_target1",
          attributes: [],
          roles: [],
          nickname: "Test Target 1",
          username: "",
        },
        {
          id: "test_target2",
          attributes: [],
          roles: [],
          nickname: "Test Target 2",
          username: "",
        },
      ],
      rig: () => [{ voter: "test_vote1", target: "test_target1" }],
    });
    expect(result).to.have.deep.property("type", VoteResultType.TIE);
    expect(result).to.have.deep.property("targets", [
      "test_target1",
      "test_target2",
    ]);
    expect(result).to.have.deep.property("timedout", [
      "test_vote1",
      "test_vote2",
      "test_vote3",
    ]);
  });
});
