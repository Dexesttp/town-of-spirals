import { expect } from "chai";
import { getUserStatsInternal, StatsData } from "../../ts/statistics";

describe("Retrieving stats", () => {
  it("Should properly get the status of the unknown self player", () => {
    const stats: StatsData = { excluded: [], names: {}, saved: {} };
    const userData = getUserStatsInternal(stats, "", "test");
    expect(userData.type).to.equals("noSelfStats");
  });

  it("Should properly get the status of the existing self player", () => {
    const stats: StatsData = {
      excluded: [],
      names: {
        test: { username: "Test Username", nickname: "Test Name" },
      },
      saved: {
        test: { wins: 5, losses: 3, roles: { role1: 2, role2: 6 } },
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
    const stats: StatsData = { excluded: [], names: {}, saved: {} };
    const userData = getUserStatsInternal(stats, "Test Name", "unk");
    expect(userData.type).to.equals("noStatsFor");
    if (userData.type !== "noStatsFor") return;
    expect(userData.name).to.equals("Test Name");
  });

  it("Should properly get the status of an existing target player (by username)", () => {
    const stats: StatsData = {
      excluded: [],
      names: {
        test: { username: "Test Username", nickname: "Test Name" },
      },
      saved: {
        test: { wins: 5, losses: 3, roles: { role1: 2, role2: 6 } },
      },
    };
    const userData = getUserStatsInternal(stats, "Test Username", "unk");
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

  it("Should properly get the status of an existing target player (by nickname)", () => {
    const stats: StatsData = {
      excluded: [],
      names: {
        test: { username: "Test Username", nickname: "Test Name" },
      },
      saved: {
        test: { wins: 5, losses: 3, roles: { role1: 2, role2: 6 } },
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
      excluded: [],
      names: {
        test: { username: "Test Username", nickname: "Test Name" },
      },
      saved: {
        test: { wins: 5, losses: 3, roles: { role1: 2, role2: 6 } },
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

  it("Should properly get the status of several existing players (by same nickname)", () => {
    const stats: StatsData = {
      excluded: [],
      names: {
        test1: { username: "Test Username 1", nickname: "Test Name" },
        test2: { username: "Test Username 2", nickname: "Test Name" },
        test3: { username: "Test Username 3", nickname: "Test Name 2" },
      },
      saved: {
        test1: { wins: 2, losses: 1, roles: { role1: 3 } },
        test2: { wins: 5, losses: 3, roles: { role1: 2, role2: 6 } },
        test3: { wins: 1, losses: 0, roles: { role1: 0 } },
      },
    };
    const userData = getUserStatsInternal(stats, "Test Name", "unk");
    expect(userData.type).to.equals("results");
    if (userData.type !== "results") return;
    expect(userData.data.length).to.equals(2);
    expect(userData.data[0].name).to.equals("Test Name");
    expect(userData.data[0].wins).to.equals(2);
    expect(userData.data[0].losses).to.equals(1);
    expect(userData.data[0].roles.length).to.equals(1);
    expect(userData.data[0].roles[0].role).to.equals("role1");
    expect(userData.data[0].roles[0].count).to.equals(3);
    expect(userData.data[1].name).to.equals("Test Name");
    expect(userData.data[1].wins).to.equals(5);
    expect(userData.data[1].losses).to.equals(3);
    expect(userData.data[1].roles.length).to.equals(2);
    expect(userData.data[1].roles[0].role).to.equals("role2");
    expect(userData.data[1].roles[0].count).to.equals(6);
    expect(userData.data[1].roles[1].role).to.equals("role1");
    expect(userData.data[1].roles[1].count).to.equals(2);
  });
});
