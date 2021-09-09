import { expect } from "chai";
import { StatsData, updateStatsInternal } from "../../ts/statistics";

describe("Updating stats", () => {
  it("Should properly add a new winning player", () => {
    const data: StatsData = { excluded: [], names: {}, saved: {} };
    updateStatsInternal(
      data,
      [{ id: "test", alive: true, role: "role1" }],
      [
        {
          id: "test",
          nickname: "Test Nickname",
          username: "Test Username",
          roles: [],
          attributes: [],
        },
      ]
    );
    // tslint:disable-next-line:no-unused-expression
    expect(data.saved["test"]).not.to.be.undefined;
    expect(data.saved["test"].wins).to.equals(1);
    expect(data.saved["test"].losses).to.equals(0);
    expect(data.saved["test"].roles["role1"]).to.equals(1);
    // tslint:disable-next-line:no-unused-expression
    expect(data.names["test"]).not.to.be.undefined;
    expect(data.names["test"].username).to.equals("Test Username");
    expect(data.names["test"].nickname).to.equals("Test Nickname");
  });

  it("Should properly add a new losing player", () => {
    const data: StatsData = { excluded: [], names: {}, saved: {} };
    updateStatsInternal(
      data,
      [{ id: "test", alive: false, role: "role1" }],
      [
        {
          id: "test",
          nickname: "Test Nickname",
          username: "Test Username",
          roles: [],
          attributes: [],
        },
      ]
    );
    // tslint:disable-next-line:no-unused-expression
    expect(data.saved["test"]).not.to.be.undefined;
    expect(data.saved["test"].wins).to.equals(0);
    expect(data.saved["test"].losses).to.equals(1);
    expect(data.saved["test"].roles["role1"]).to.equals(1);
    // tslint:disable-next-line:no-unused-expression
    expect(data.names["test"]).not.to.be.undefined;
    expect(data.names["test"].username).to.equals("Test Username");
    expect(data.names["test"].nickname).to.equals("Test Nickname");
  });

  it("Should not add a new disabled winning player", () => {
    const data: StatsData = { excluded: ["test"], names: {}, saved: {} };
    updateStatsInternal(
      data,
      [{ id: "test", alive: true, role: "role1" }],
      [
        {
          id: "test",
          nickname: "Test Nickname",
          username: "Test Username",
          roles: [],
          attributes: [],
        },
      ]
    );
    // tslint:disable-next-line:no-unused-expression
    expect(data.saved["test"]).to.be.undefined;
    // tslint:disable-next-line:no-unused-expression
    expect(data.names["test"]).to.be.undefined;
  });

  it("Should not add a new disabled losing player", () => {
    const data: StatsData = { excluded: ["test"], names: {}, saved: {} };
    updateStatsInternal(
      data,
      [{ id: "test", alive: false, role: "role1" }],
      [
        {
          id: "test",
          nickname: "Test Nickname",
          username: "Test Username",
          roles: [],
          attributes: [],
        },
      ]
    );
    // tslint:disable-next-line:no-unused-expression
    expect(data.saved["test"]).to.be.undefined;
    // tslint:disable-next-line:no-unused-expression
    expect(data.names["test"]).to.be.undefined;
  });

  it("Should properly update an existing winning player", () => {
    const data: StatsData = {
      excluded: [],
      names: {
        test: { username: "Test Old Username", nickname: "Test Old Name" },
      },
      saved: {
        test: { wins: 1, losses: 1, roles: { role1: 1, role2: 1 } },
      },
    };
    updateStatsInternal(
      data,
      [{ id: "test", alive: true, role: "role1" }],
      [
        {
          id: "test",
          nickname: "Test Nickname",
          username: "Test Username",
          roles: [],
          attributes: [],
        },
      ]
    );
    // tslint:disable-next-line:no-unused-expression
    expect(data.saved["test"]).not.to.be.undefined;
    expect(data.saved["test"].wins).to.equals(2);
    expect(data.saved["test"].losses).to.equals(1);
    expect(data.saved["test"].roles["role1"]).to.equals(2);
    expect(data.saved["test"].roles["role2"]).to.equals(1);
    // tslint:disable-next-line:no-unused-expression
    expect(data.names["test"]).not.to.be.undefined;
    expect(data.names["test"].username).to.equals("Test Username");
    expect(data.names["test"].nickname).to.equals("Test Nickname");
  });

  it("Should properly update an existing losing player", () => {
    const data: StatsData = {
      excluded: [],
      names: {
        test: { username: "Test Old Username", nickname: "Test Old Name" },
      },
      saved: {
        test: { wins: 1, losses: 1, roles: { role1: 1, role2: 1 } },
      },
    };
    updateStatsInternal(
      data,
      [{ id: "test", alive: false, role: "role1" }],
      [
        {
          id: "test",
          nickname: "Test Nickname",
          username: "Test Username",
          roles: [],
          attributes: [],
        },
      ]
    );
    // tslint:disable-next-line:no-unused-expression
    expect(data.saved["test"]).not.to.be.undefined;
    expect(data.saved["test"].wins).to.equals(1);
    expect(data.saved["test"].losses).to.equals(2);
    expect(data.saved["test"].roles["role1"]).to.equals(2);
    expect(data.saved["test"].roles["role2"]).to.equals(1);
    // tslint:disable-next-line:no-unused-expression
    expect(data.names["test"]).not.to.be.undefined;
    expect(data.names["test"].username).to.equals("Test Username");
    expect(data.names["test"].nickname).to.equals("Test Nickname");
  });
});
