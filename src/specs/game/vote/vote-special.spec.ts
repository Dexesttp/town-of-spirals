import { startVoteFactory } from "../../../ts/game/vote";
import { TimerPromise } from "../../../ts/utils/timer";
import { VoteRequest, VoteResultType } from "../../../ts/game/vote/types";
import { expect } from "chai";

describe("The Vote engine", () => {
    it("Should ignore a changed vote after the vote is closed", async () => {
        const startVote = startVoteFactory(
            { players: [], playerInterface: {}, sendMessage: async () => {} },
            (t) => TimerPromise(1),
            function* (v, t, shouldBePrivate) {
                yield Promise.resolve<VoteRequest>({voterID: "test_vote1", targetID: "test_target1"});
                yield Promise.resolve<VoteRequest>({voterID: "test_vote1", targetID: "test_target2"});
            },
            (m, voters, toEveryone) => { /* NO OP */ },
        );
        const result = await startVote({
            voters: [
                {id: "test_vote1", attributes: [], roles: [], nickname: "Test Voter 1", username: ""},
            ],
            targets: [
                {id: "test_target1", attributes: [], roles: [], nickname: "Test Target 1", username: ""},
                {id: "test_target2", attributes: [], roles: [], nickname: "Test Target 2", username: ""},
            ],
        });
        expect(result).to.have.deep.property("type", VoteResultType.UNANIMITY);
        expect(result).to.have.deep.property("target", "test_target1");
        expect(result).to.have.deep.property("timedout", []);
    });

    it("Should accept a changed vote before the vote is closed", async () => {
        const startVote = startVoteFactory(
            { players: [], playerInterface: {}, sendMessage: async () => {} },
            (t) => TimerPromise(1),
            function* (v, t, shouldBePrivate) {
                yield Promise.resolve<VoteRequest>({voterID: "test_vote1", targetID: "test_target1"});
                yield Promise.resolve<VoteRequest>({voterID: "test_vote1", targetID: "test_target2"});
                yield Promise.resolve<VoteRequest>({voterID: "test_vote2", targetID: "test_target2"});
            },
            (m, voters, toEveryone) => { /* NO OP */ },
        );
        const result = await startVote({
            voters: [
                {id: "test_vote1", attributes: [], roles: [], nickname: "Test Voter 1", username: ""},
                {id: "test_vote2", attributes: [], roles: [], nickname: "Test Voter 2", username: ""},
            ],
            targets: [
                {id: "test_target1", attributes: [], roles: [], nickname: "Test Target 1", username: ""},
                {id: "test_target2", attributes: [], roles: [], nickname: "Test Target 2", username: ""},
            ],
        });
        expect(result).to.have.deep.property("type", VoteResultType.UNANIMITY);
        expect(result).to.have.deep.property("target", "test_target2");
        expect(result).to.have.deep.property("timedout", []);
    });

    it("Should accept a changed vote before the vote is closed if there's a timeout", async () => {
        const startVote = startVoteFactory(
            { players: [], playerInterface: {}, sendMessage: async () => {} },
            (t) => TimerPromise(1),
            function* (v, t, shouldBePrivate) {
                yield Promise.resolve<VoteRequest>({voterID: "test_vote1", targetID: "test_target1"});
                yield Promise.resolve<VoteRequest>({voterID: "test_vote1", targetID: "test_target2"});
            },
            (m, voters, toEveryone) => { /* NO OP */ },
        );
        const result = await startVote({
            voters: [
                {id: "test_vote1", attributes: [], roles: [], nickname: "Test Voter 1", username: ""},
                {id: "test_vote2", attributes: [], roles: [], nickname: "Test Voter 2", username: ""},
            ],
            targets: [
                {id: "test_target1", attributes: [], roles: [], nickname: "Test Target 1", username: ""},
                {id: "test_target2", attributes: [], roles: [], nickname: "Test Target 2", username: ""},
            ],
        });
        expect(result).to.have.deep.property("type", VoteResultType.MAJORITY);
        expect(result).to.have.deep.property("target", "test_target2");
        expect(result).to.have.deep.property("timedout", ["test_vote2"]);
    });

    it("Should handle a wrong vote then a good vote", async () => {
        const startVote = startVoteFactory(
            { players: [], playerInterface: {}, sendMessage: async () => {} },
            (t) => TimerPromise(1),
            function* (v, t, shouldBePrivate) {
                yield Promise.reject<VoteRequest>("test");
                yield Promise.resolve<VoteRequest>({voterID: "test_vote1", targetID: "test_target1"});
            },
            (m, voters, toEveryone) => { /* NO OP */ },
        );
        const result = await startVote({
            voters: [
                {id: "test_vote1", attributes: [], roles: [], nickname: "Test Voter 1", username: ""},
            ],
            targets: [
                {id: "test_target1", attributes: [], roles: [], nickname: "Test Target 1", username: ""},
                {id: "test_target2", attributes: [], roles: [], nickname: "Test Target 2", username: ""},
            ],
        });
        expect(result).to.have.deep.property("type", VoteResultType.UNANIMITY);
        expect(result).to.have.deep.property("target", "test_target1");
        expect(result).to.have.deep.property("timedout", []);
    });

    it("Should handle a good vote, a wrong vote then another good vote", async () => {
        const startVote = startVoteFactory(
            { players: [], playerInterface: {}, sendMessage: async () => {} },
            (t) => TimerPromise(1),
            function* (v, t, shouldBePrivate) {
                yield Promise.resolve<VoteRequest>({voterID: "test_vote1", targetID: "test_target1"});
                yield Promise.reject<VoteRequest>("test");
                yield Promise.resolve<VoteRequest>({voterID: "test_vote2", targetID: "test_target2"});
            },
            (m, voters, toEveryone) => { /* NO OP */ },
        );
        const result = await startVote({
            voters: [
                {id: "test_vote1", attributes: [], roles: [], nickname: "Test Voter 1", username: ""},
                {id: "test_vote2", attributes: [], roles: [], nickname: "Test Voter 2", username: ""},
            ],
            targets: [
                {id: "test_target1", attributes: [], roles: [], nickname: "Test Target 1", username: ""},
                {id: "test_target2", attributes: [], roles: [], nickname: "Test Target 2", username: ""},
            ],
        });
        expect(result).to.have.deep.property("type", VoteResultType.TIE);
        expect(result).to.have.deep.property("targets", ["test_target1", "test_target2"]);
        expect(result).to.have.deep.property("timedout", []);
    });

    it("Should handle only wrong votes", async () => {
        const startVote = startVoteFactory(
            { players: [], playerInterface: {}, sendMessage: async () => {} },
            (t) => TimerPromise(1),
            function* (v, t, shouldBePrivate) {
                yield Promise.reject<VoteRequest>("test1");
                yield Promise.reject<VoteRequest>("test2");
                yield Promise.reject<VoteRequest>("test3");
            },
            (m, voters, toEveryone) => { /* NO OP */ },
        );
        const result = await startVote({
            voters: [
                {id: "test_vote1", attributes: [], roles: [], nickname: "Test Voter 1", username: ""},
            ],
            targets: [
                {id: "test_target1", attributes: [], roles: [], nickname: "Test Target 1", username: ""},
                {id: "test_target2", attributes: [], roles: [], nickname: "Test Target 2", username: ""},
            ],
        });
        expect(result).to.have.deep.property("type", VoteResultType.TIE);
        expect(result).to.have.deep.property("targets", ["test_target1", "test_target2"]);
        expect(result).to.have.deep.property("timedout", ["test_vote1"]);
    });

    it("Should handle a wrong vote, a good vote then ignore a remaining wrong vote", async () => {
        const startVote = startVoteFactory(
            { players: [], playerInterface: {}, sendMessage: async () => {} },
            (t) => TimerPromise(1),
            function* (v, t, shouldBePrivate) {
                yield Promise.reject<VoteRequest>("test1");
                yield Promise.resolve<VoteRequest>({voterID: "test_vote1", targetID: "test_target1"});
                yield Promise.reject<VoteRequest>("test3");
            },
            (m, voters, toEveryone) => { /* NO OP */ },
        );
        const result = await startVote({
            voters: [
                {id: "test_vote1", attributes: [], roles: [], nickname: "Test Voter 1", username: ""},
            ],
            targets: [
                {id: "test_target1", attributes: [], roles: [], nickname: "Test Target 1", username: ""},
                {id: "test_target2", attributes: [], roles: [], nickname: "Test Target 2", username: ""},
            ],
        });
        expect(result).to.have.deep.property("type", VoteResultType.UNANIMITY);
        expect(result).to.have.deep.property("target", "test_target1");
        expect(result).to.have.deep.property("timedout", []);
    });

    it("Should handle a wrong vote, a good vote then a wrong vote", async () => {
        const startVote = startVoteFactory(
            { players: [], playerInterface: {}, sendMessage: async () => {} },
            (t) => TimerPromise(1),
            function* (v, t, shouldBePrivate) {
                yield Promise.reject<VoteRequest>("test1");
                yield Promise.resolve<VoteRequest>({voterID: "test_vote1", targetID: "test_target1"});
                yield Promise.reject<VoteRequest>("test3");
            },
            (m, voters, toEveryone) => { /* NO OP */ },
        );
        const result = await startVote({
            voters: [
                {id: "test_vote1", attributes: [], roles: [], nickname: "Test Voter 1", username: ""},
                {id: "test_vote2", attributes: [], roles: [], nickname: "Test Voter 2", username: ""},
            ],
            targets: [
                {id: "test_target1", attributes: [], roles: [], nickname: "Test Target 1", username: ""},
                {id: "test_target2", attributes: [], roles: [], nickname: "Test Target 2", username: ""},
            ],
        });
        expect(result).to.have.deep.property("type", VoteResultType.MAJORITY);
        expect(result).to.have.deep.property("target", "test_target1");
        expect(result).to.have.deep.property("timedout", ["test_vote2"]);
    });
});
