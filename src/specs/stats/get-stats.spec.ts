import { expect } from "chai";
import { getUserStatsInternal, StatsData } from "../../ts/statistics";

describe("Retrieving stats", () => {
    it("Should properly get the status of the unknown self player", () => {
        const stats: StatsData = { excluded: [], saved: {} };
        const userData = getUserStatsInternal(stats, "", "test");
        expect(userData.type).to.equals("noSelfStats");
    });

    it("Should properly get the status of the existing self player", () => {
        const stats: StatsData = {
            excluded: [], saved: {
                "test": { name: "Test Name", wins: 5, losses: 3, roles: { "role1": 2, "role2": 6 } },
            },
        };
        const userData = getUserStatsInternal(stats, "", "test");
        expect(userData.type).to.equals("result");
        if (userData.type !== "result") return;
        expect(userData.name).to.equals("Test Name");
        expect(userData.wins).to.equals(5);
        expect(userData.losses).to.equals(3);
        expect(userData.roles.length).to.equals(2);
        expect(userData.roles[0].role).to.equals("role2");
        expect(userData.roles[0].count).to.equals(6);
        expect(userData.roles[1].role).to.equals("role1");
        expect(userData.roles[1].count).to.equals(2);
    });

    it("Should properly get the status of an unknown target player", () => {
        const stats: StatsData = { excluded: [], saved: {} };
        const userData = getUserStatsInternal(stats, "Test Name", "unk");
        expect(userData.type).to.equals("noStatsFor");
        if (userData.type !== "noStatsFor") return;
        expect(userData.name).to.equals("Test Name");
    });

    it("Should properly get the status of an existing target player (by name)", () => {
        const stats: StatsData = {
            excluded: [], saved: {
                "test": { name: "Test Name", wins: 5, losses: 3, roles: { "role1": 2, "role2": 6 } },
            },
        };
        const userData = getUserStatsInternal(stats, "Test Name", "unk");
        expect(userData.type).to.equals("result");
        if (userData.type !== "result") return;
        expect(userData.name).to.equals("Test Name");
        expect(userData.wins).to.equals(5);
        expect(userData.losses).to.equals(3);
        expect(userData.roles.length).to.equals(2);
        expect(userData.roles[0].role).to.equals("role2");
        expect(userData.roles[0].count).to.equals(6);
        expect(userData.roles[1].role).to.equals("role1");
        expect(userData.roles[1].count).to.equals(2);
    });

    it("Should properly get the status of an existing target player (by id)", () => {
        const stats: StatsData = {
            excluded: [], saved: {
                "test": { name: "Test Name", wins: 5, losses: 3, roles: { "role1": 2, "role2": 6 } },
            },
        };
        const userData = getUserStatsInternal(stats, "test", "unk");
        expect(userData.type).to.equals("result");
        if (userData.type !== "result") return;
        expect(userData.name).to.equals("Test Name");
        expect(userData.wins).to.equals(5);
        expect(userData.losses).to.equals(3);
        expect(userData.roles.length).to.equals(2);
        expect(userData.roles[0].role).to.equals("role2");
        expect(userData.roles[0].count).to.equals(6);
        expect(userData.roles[1].role).to.equals("role1");
        expect(userData.roles[1].count).to.equals(2);
    });
});
