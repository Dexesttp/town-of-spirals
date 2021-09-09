import { expect } from "chai";
import { getLeaderboardInternal, StatsData } from "../../ts/statistics";

describe("Retrieving leaderboard", () => {
  it("Should show no results if there is no stats", () => {
    const stats: StatsData = { excluded: [], names: {}, saved: {} };
    const lb = getLeaderboardInternal(stats);
    expect(lb.length).to.equals(0);
  });
  it("Should show a single result if there is one player", () => {
    const stats: StatsData = {
      excluded: [],
      names: {
        test1: { username: "Test Username 1", nickname: "Test Name 1" },
      },
      saved: {
        test1: { wins: 5, losses: 3, roles: { role1: 2, role2: 6 } },
      },
    };
    const lb = getLeaderboardInternal(stats);
    expect(lb.length).to.equals(1);
    expect(lb[0].id).to.equals("test1");
    expect(lb[0].name).to.equals("Test Name 1");
    expect(lb[0].wins).to.equals(5);
  });
  it("Should show an ordered list of results if there is several players", () => {
    const stats: StatsData = {
      excluded: [],
      names: {
        test1: { username: "Test Username 1", nickname: "Test Name 1" },
        test2: { username: "Test Username 2", nickname: "Test Name 2" },
        test3: { username: "Test Username 3", nickname: "Test Name 3" },
        test4: { username: "Test Username 4", nickname: "Test Name 4" },
      },
      saved: {
        test1: { wins: 5, losses: 3, roles: { role1: 2, role2: 6 } },
        test2: { wins: 10, losses: 3, roles: { role1: 2, role2: 6 } },
        test3: { wins: 2, losses: 3, roles: { role1: 2, role2: 6 } },
        test4: { wins: 4, losses: 3, roles: { role1: 2, role2: 6 } },
      },
    };
    const lb = getLeaderboardInternal(stats);
    expect(lb.length).to.equals(4);
    expect(lb[0].id).to.equals("test2");
    expect(lb[0].name).to.equals("Test Name 2");
    expect(lb[0].wins).to.equals(10);
    expect(lb[1].id).to.equals("test1");
    expect(lb[1].name).to.equals("Test Name 1");
    expect(lb[1].wins).to.equals(5);
    expect(lb[2].id).to.equals("test4");
    expect(lb[2].name).to.equals("Test Name 4");
    expect(lb[2].wins).to.equals(4);
    expect(lb[3].id).to.equals("test3");
    expect(lb[3].name).to.equals("Test Name 3");
    expect(lb[3].wins).to.equals(2);
  });
});
