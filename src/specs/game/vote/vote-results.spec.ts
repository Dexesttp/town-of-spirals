import { expect } from "chai";
import { VoteResultType } from "../../../ts/game/vote/types";
import { GetVoteFactory } from "./get-vote-factory";

describe("The Vote engine", () => {
  it("Should handle a single user voting as an unanime vote", async () => {
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
    });
    expect(result).to.have.deep.property("type", VoteResultType.UNANIMITY);
    expect(result).to.have.deep.property("target", "test_target1");
    expect(result).to.have.deep.property("timedout", []);
  });

  it("Should handle three voters for an unanime vote", async () => {
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
    });
    expect(result).to.have.deep.property("type", VoteResultType.UNANIMITY);
    expect(result).to.have.deep.property("target", "test_target1");
    expect(result).to.have.deep.property("timedout", []);
  });

  it("Should handle three voters for a majority vote", async () => {
    const startVote = GetVoteFactory([
      { voterID: "test_vote1", targetID: "test_target1" },
      { voterID: "test_vote2", targetID: "test_target1" },
      { voterID: "test_vote3", targetID: "test_target2" },
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
    });
    expect(result).to.have.deep.property("type", VoteResultType.MAJORITY);
    expect(result).to.have.deep.property("target", "test_target1");
    expect(result).to.have.deep.property("timedout", []);
  });

  it("Should handle three voters for a majority vote when there's a timeout", async () => {
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
    });
    expect(result).to.have.deep.property("type", VoteResultType.MAJORITY);
    expect(result).to.have.deep.property("target", "test_target1");
    expect(result).to.have.deep.property("timedout", [
      "test_vote2",
      "test_vote3",
    ]);
  });

  it("Should handle three voters as unanime vote for no-vote", async () => {
    const startVote = GetVoteFactory([
      { voterID: "test_vote1", targetID: null },
      { voterID: "test_vote2", targetID: null },
      { voterID: "test_vote3", targetID: null },
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
    });
    expect(result).to.have.deep.property(
      "type",
      VoteResultType.UNANIMITY_NO_VOTE
    );
    expect(result).to.have.deep.property("timedout", []);
  });

  it("Should handle three voters as a majority vote for no-vote", async () => {
    const startVote = GetVoteFactory([
      { voterID: "test_vote1", targetID: null },
      { voterID: "test_vote2", targetID: null },
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
    });
    expect(result).to.have.deep.property(
      "type",
      VoteResultType.MAJORITY_NO_VOTE
    );
    expect(result).to.have.deep.property("timedout", []);
  });

  it("Should handle three voters as a majority vote for no-vote when there's a timeout", async () => {
    const startVote = GetVoteFactory([
      { voterID: "test_vote1", targetID: null },
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

  it("Should handle two voters ties", async () => {
    const startVote = GetVoteFactory([
      { voterID: "test_vote1", targetID: "test_target1" },
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
    });
    expect(result).to.have.deep.property("type", VoteResultType.TIE);
    expect(result).to.have.deep.property("targets", [
      "test_target1",
      "test_target2",
    ]);
    expect(result).to.have.deep.property("timedout", []);
  });

  it("Should handle two voters ties with no-vote", async () => {
    const startVote = GetVoteFactory([
      { voterID: "test_vote1", targetID: null },
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
    });
    expect(result).to.have.deep.property("type", VoteResultType.TIE);
    expect(result).to.have.deep.property("targets", [null, "test_target2"]);
    expect(result).to.have.deep.property("timedout", []);
  });

  it("Should handle three voters ties in case of timeout", async () => {
    const startVote = GetVoteFactory([
      { voterID: "test_vote1", targetID: "test_target1" },
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
    });
    expect(result).to.have.deep.property("type", VoteResultType.TIE);
    expect(result).to.have.deep.property("targets", [
      "test_target1",
      "test_target2",
    ]);
    expect(result).to.have.deep.property("timedout", ["test_vote3"]);
  });

  it("Should handle three voters ties with no-vote in case of timeout", async () => {
    const startVote = GetVoteFactory([
      { voterID: "test_vote1", targetID: null },
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
    });
    expect(result).to.have.deep.property("type", VoteResultType.TIE);
    expect(result).to.have.deep.property("targets", [null, "test_target2"]);
    expect(result).to.have.deep.property("timedout", ["test_vote3"]);
  });

  it("Should handle single voter tie if nobody answered", async () => {
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
    });
    expect(result).to.have.deep.property("type", VoteResultType.TIE);
    expect(result).to.have.deep.property("targets", [
      "test_target1",
      "test_target2",
    ]);
    expect(result).to.have.deep.property("timedout", ["test_vote1"]);
  });

  it("Should handle three voters ties if nobody answered", async () => {
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
