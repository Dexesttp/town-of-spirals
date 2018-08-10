import { expect } from "chai";
import { VoteResultType } from "../../../ts/game/vote/types";
import { GetVoteFactory } from "./get-vote-factory";

describe("The Vote factory", () => {
    it("Should create a factory without errors", () => {
        const startVote = GetVoteFactory([]);
    });

    it("Should validate the vote if all the votes are handled", async () => {
        const startVote = GetVoteFactory([{ voterID: "test_vote", targetID: "test_target" }]);
        const result = await startVote({
            voters: [
                { id: "test_vote", attributes: [], roles: [], nickname: "Test Voter 1", username: "" },
            ],
            targets: [
                { id: "test_target", attributes: [], roles: [], nickname: "Test Target", username: "" },
            ],
        });
        expect(result).to.have.deep.property("target", "test_target");
        expect(result).to.have.deep.property("timedout", []);
        expect(result).to.have.deep.property("type", VoteResultType.UNANIMITY);
    });

    it("Should validate the vote if not all the votes are handled", async () => {
        const startVote = GetVoteFactory([{ voterID: "test_vote", targetID: "test_target" }]);
        const result = await startVote({
            voters: [
                { id: "test_vote", attributes: [], roles: [], nickname: "Test Voter 1", username: "" },
                { id: "test_absent", attributes: [], roles: [], nickname: "Test Absent", username: "" },
            ],
            targets: [
                { id: "test_target", attributes: [], roles: [], nickname: "Test Target", username: "" },
            ],
        });
        expect(result).to.have.deep.property("target", "test_target");
        expect(result).to.have.deep.property("timedout", ["test_absent"]);
        expect(result).to.have.deep.property("type", VoteResultType.MAJORITY);
    });

    it("Should validate the vote if no votes are handled", async () => {
        const startVote = GetVoteFactory([{ voterID: "test_vote", targetID: "test_target" }]);
        const result = await startVote({
            voters: [
                { id: "test_absent", attributes: [], roles: [], nickname: "Test Absent", username: "" },
            ],
            targets: [
                { id: "test_target", attributes: [], roles: [], nickname: "Test Target", username: "" },
            ],
        });
        expect(result).to.have.deep.property("type", VoteResultType.TIE);
        expect(result).to.have.deep.property("timedout", ["test_absent"]);
        expect(result).to.have.deep.property("targets", ["test_target"]);
    });

    it("Should validate the vote if several voters are voting", async () => {
        const startVote = GetVoteFactory([
            { voterID: "test_voter1", targetID: "test_target" },
            { voterID: "test_voter2", targetID: "test_target" },
        ]);
        const result = await startVote({
            voters: [
                { id: "test_voter1", attributes: [], roles: [], nickname: "Test Voter 1", username: "" },
                { id: "test_voter2", attributes: [], roles: [], nickname: "Test Voter 2", username: "" },
            ],
            targets: [
                { id: "test_target", attributes: [], roles: [], nickname: "Test Target", username: "" },
            ],
        });
        expect(result).to.have.deep.property("target", "test_target");
        expect(result).to.have.deep.property("timedout", []);
        expect(result).to.have.deep.property("type", VoteResultType.UNANIMITY);
    });
});
