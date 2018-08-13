import { expect } from "chai";
import { StatsData, updateStatsInternal } from "../../ts/statistics";

describe("Updating stats", () => {
    it("Should properly add a new winning player", () => {
        const data: StatsData = { excluded: [], saved: {} };
        updateStatsInternal(
            data,
            [
                { id: "test", alive: true, role: "role1" },
            ],
            [
                { id: "test", nickname: "Test Nickname", username: "Test Username", roles: [], attributes: [] },
            ],
        );
        // tslint:disable-next-line:no-unused-expression
        expect(data.saved["test"]).not.to.be.undefined;
        expect(data.saved["test"].name).to.equals("Test Nickname");
        expect(data.saved["test"].wins).to.equals(1);
        expect(data.saved["test"].losses).to.equals(0);
        expect(data.saved["test"].roles["role1"]).to.equals(1);
    });

    it("Should properly add a new losing player", () => {
        const data: StatsData = { excluded: [], saved: {} };
        updateStatsInternal(
            data,
            [
                { id: "test", alive: false, role: "role1" },
            ],
            [
                { id: "test", nickname: "Test Nickname", username: "Test Username", roles: [], attributes: [] },
            ],
        );
        // tslint:disable-next-line:no-unused-expression
        expect(data.saved["test"]).not.to.be.undefined;
        expect(data.saved["test"].name).to.equals("Test Nickname");
        expect(data.saved["test"].wins).to.equals(0);
        expect(data.saved["test"].losses).to.equals(1);
        expect(data.saved["test"].roles["role1"]).to.equals(1);
    });

    it("Should not add a new disabled winning player", () => {
        const data: StatsData = { excluded: ["test"], saved: {} };
        updateStatsInternal(
            data,
            [
                { id: "test", alive: true, role: "role1" },
            ],
            [
                { id: "test", nickname: "Test Nickname", username: "Test Username", roles: [], attributes: [] },
            ],
        );
        // tslint:disable-next-line:no-unused-expression
        expect(data.saved["test"]).to.be.undefined;
    });

    it("Should not add a new disabled losing player", () => {
        const data: StatsData = { excluded: ["test"], saved: {} };
        updateStatsInternal(
            data,
            [
                { id: "test", alive: false, role: "role1" },
            ],
            [
                { id: "test", nickname: "Test Nickname", username: "Test Username", roles: [], attributes: [] },
            ],
        );
        // tslint:disable-next-line:no-unused-expression
        expect(data.saved["test"]).to.be.undefined;
    });

    it("Should properly update an existing winning player", () => {
        const data: StatsData = {
            excluded: [], saved: {
                "test": { name: "Test Old Name", wins: 1, losses: 1, roles: { "role1": 1, "role2": 1 } },
            },
        };
        updateStatsInternal(
            data,
            [
                { id: "test", alive: true, role: "role1" },
            ],
            [
                { id: "test", nickname: "Test Nickname", username: "Test Username", roles: [], attributes: [] },
            ],
        );
        // tslint:disable-next-line:no-unused-expression
        expect(data.saved["test"]).not.to.be.undefined;
        expect(data.saved["test"].name).to.equals("Test Nickname");
        expect(data.saved["test"].wins).to.equals(2);
        expect(data.saved["test"].losses).to.equals(1);
        expect(data.saved["test"].roles["role1"]).to.equals(2);
        expect(data.saved["test"].roles["role2"]).to.equals(1);
    });

    it("Should properly update an existing losing player", () => {
        const data: StatsData = {
            excluded: [], saved: {
                "test": { name: "Test Old Name", wins: 1, losses: 1, roles: { "role1": 1, "role2": 1 } },
            },
        };
        updateStatsInternal(
            data,
            [
                { id: "test", alive: false, role: "role1" },
            ],
            [
                { id: "test", nickname: "Test Nickname", username: "Test Username", roles: [], attributes: [] },
            ],
        );
        // tslint:disable-next-line:no-unused-expression
        expect(data.saved["test"]).not.to.be.undefined;
        expect(data.saved["test"].name).to.equals("Test Nickname");
        expect(data.saved["test"].wins).to.equals(1);
        expect(data.saved["test"].losses).to.equals(2);
        expect(data.saved["test"].roles["role1"]).to.equals(2);
        expect(data.saved["test"].roles["role2"]).to.equals(1);
    });
});
