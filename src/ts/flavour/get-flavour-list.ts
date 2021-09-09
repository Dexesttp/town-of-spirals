import * as path from "path";
import { PREFIX } from "../client/command-handler";
import { EndingFlavour } from "../game/base-check-end";
import { DayFlavour } from "../game/base-day";
import { NightFlavour } from "../game/base-night";
import { NotifyFlavour } from "../game/base-notify-roles";
import { ResolveBrokenFlavour } from "../game/base-resolve-all-broken";
import { PlayerData } from "../game/data/player";
import {
  DeprogrammerFlavourList,
  DEPROGRAMMER_ROLE,
} from "../roles/deprogrammer";
import { DetectiveFlavourList, DETECTIVE_ROLE } from "../roles/detective";
import { HypnotistFlavourList, HYPNOTIST_ROLE } from "../roles/hypnotist";
import { JesterEndingFlavour, JESTER_ROLE } from "../roles/jester";
import getRandom from "../utils/rand-from-array";
import {
  FormatOwner,
  FormatPlayerList,
  FormatTarget,
  LoadToggledData,
  LoadVoteFlavour,
  LoadYamlFile,
} from "./load-flavours";

type MumbleFlavour = Array<(userName: string, ownerName: string) => string>;

export type FlavourEntry = {
  baseDay: DayFlavour;
  baseNight: NightFlavour;
  checkEnd: EndingFlavour;
  notifyRoles: NotifyFlavour;
  resolveBroken: ResolveBrokenFlavour;
  mumble: MumbleFlavour;
  handleHypnotist: HypnotistFlavourList;
  handleDeprogrammer: DeprogrammerFlavourList;
  handleDetective: DetectiveFlavourList;
  handleJester: JesterEndingFlavour;
};

export function getMumbleFlavour(folderName: string): MumbleFlavour {
  const data = LoadYamlFile(path.join(folderName, "mumble.yaml"));
  return data.mumble.map(
    (text: string) => (target: string, owner: string) =>
      text.replace(/\[target\]/gi, target).replace(/\[owner\]/gi, owner)
  );
}

export function getBaseDayFlavour(folderName: string): DayFlavour {
  const data = LoadYamlFile(path.join(folderName, "town.yaml"));
  function loadRoleData(fileName: string) {
    const intData = LoadYamlFile(path.join(folderName, fileName));
    return (player: PlayerData, roleList: string[]) =>
      FormatTarget(player, getRandom<string>(intData.reveal, 1)[0]);
  }
  const roles: {
    [role: string]: (player: PlayerData, roleList: string[]) => string;
  } = {};
  roles[HYPNOTIST_ROLE] = loadRoleData("hypnotist.yaml");
  roles[DETECTIVE_ROLE] = loadRoleData("detective.yaml");
  roles[DEPROGRAMMER_ROLE] = loadRoleData("deprogrammer.yaml");
  roles[JESTER_ROLE] = (player: PlayerData, roleList: string[]) =>
    FormatTarget(
      player,
      getRandom<string>(
        LoadYamlFile(path.join(folderName, "jester.yaml")).reveal_day,
        1
      )[0]
    );
  const townieData = LoadYamlFile(path.join(folderName, "townie.yaml"));
  return {
    intro: (voteList) =>
      getRandom<string>(data.startVote, 1)[0]
        .replace(/\[voteList\]/gi, `\n${voteList.join("\n")}`)
        .replace(
          /\[command\.vote\]/gi,
          `\`${PREFIX} vote <name>\` or \`${PREFIX} vote-nb <number>\``
        )
        .replace(/\[command\.no_vote\]/gi, `\`${PREFIX} no-vote\``),
    vote: LoadVoteFlavour(data.vote),
    break: (target, owner) =>
      FormatOwner(
        owner,
        FormatTarget(target, getRandom<string>(data.action.break, 1)[0])
      ),
    dissent: () => getRandom<string>(data.action.skip.dissent, 1)[0],
    noVote: () => getRandom<string>(data.action.skip.noVote, 1)[0],
    roles,
    none: (target) =>
      FormatTarget(target, getRandom<string>(townieData.reveal, 1)[0]),
    unknown: (player, roleList) =>
      `It appears <@${player.id}> was a ${roleList.join(", ")}.`,
  };
}

export function getBaseNightFlavour(folderName: string): NightFlavour {
  const data = LoadYamlFile(path.join(folderName, "events.yaml"));
  return {
    night: () => getRandom<string>(data.newNight, 1)[0],
  };
}

export function getCheckEndFlavour(folderName: string): EndingFlavour {
  const data = LoadYamlFile(path.join(folderName, "events.yaml"));
  return {
    hypnotists: LoadToggledData(
      data.victory.hypnotists,
      (rawData: string[], playerList, allPlayerList, hypnotistList) =>
        FormatPlayerList(playerList, getRandom(rawData, 1)[0])
          .replace(
            /\[allMention\]/gi,
            allPlayerList.map((p) => `<@${p.id}>`).join(" ")
          )
          .replace(
            /\[hypnotistList\]/gi,
            hypnotistList.map((p) => p.nickname).join(", ")
          )
    ),
    town: LoadToggledData(
      data.victory.town,
      (rawData: string[], playerList, allPlayerList, hypnotistList) =>
        FormatPlayerList(playerList, getRandom(rawData, 1)[0])
          .replace(
            /\[allMention\]/gi,
            allPlayerList.map((p) => `<@${p.id}>`).join(" ")
          )
          .replace(
            /\[hypnotistList\]/gi,
            hypnotistList.map((p) => p.nickname).join(", ")
          )
    ),
    nobody: (allPlayerList, hypnotistList) =>
      getRandom<string>(data.victory.nobody, 1)[0]
        .replace(
          /\[allMention\]/gi,
          allPlayerList.map((p) => `<@${p.id}>`).join(" ")
        )
        .replace(
          /\[hypnotistList\]/gi,
          hypnotistList.map((p) => p.nickname).join(", ")
        ),
  };
}

export function getNotifyFlavour(folderName: string): NotifyFlavour {
  const data = LoadYamlFile(path.join(folderName, "events.yaml"));
  function loadRoleData(fileName: string) {
    const intData = LoadYamlFile(path.join(folderName, fileName));
    return (player: PlayerData, roleList: string[]) =>
      getRandom<string>(intData.role, 1)[0];
  }
  const roles: {
    [role: string]: (player: PlayerData, roleList: string[]) => string;
  } = {};
  roles[HYPNOTIST_ROLE] = loadRoleData("hypnotist.yaml");
  roles[DETECTIVE_ROLE] = loadRoleData("detective.yaml");
  roles[DEPROGRAMMER_ROLE] = loadRoleData("deprogrammer.yaml");
  roles[JESTER_ROLE] = loadRoleData("jester.yaml");
  const townieData = LoadYamlFile(path.join(folderName, "townie.yaml"));
  return {
    start: (playerList, hypnotistCount) =>
      getRandom<string>(data.start, 1)[0]
        .replace(
          /\[playerMentionList\]/gi,
          playerList.map((p) => `<@${p.id}>`).join(" ")
        )
        .replace(/\[hypnotistCount\]/gi, `${hypnotistCount}`),
    roles,
    none: (player) => getRandom<string>(townieData.role, 1)[0],
    unknown: (player, roleList) =>
      `A new game has started ! You are a ${roleList.join(", ")}`,
  };
}

export function getResolveBrokenFlavour(
  folderName: string
): ResolveBrokenFlavour {
  const data = LoadYamlFile(path.join(folderName, "events.yaml"));
  function loadRoleData(fileName: string) {
    const intData = LoadYamlFile(path.join(folderName, fileName));
    return (player: PlayerData, roleList: string[]) =>
      FormatTarget(player, getRandom<string>(intData.reveal, 1)[0]);
  }
  const roles: {
    [role: string]: (player: PlayerData, roleList: string[]) => string;
  } = {};
  roles[HYPNOTIST_ROLE] = loadRoleData("hypnotist.yaml");
  roles[DETECTIVE_ROLE] = loadRoleData("detective.yaml");
  roles[DEPROGRAMMER_ROLE] = loadRoleData("deprogrammer.yaml");
  roles[JESTER_ROLE] = loadRoleData("jester.yaml");
  const townieData = LoadYamlFile(path.join(folderName, "townie.yaml"));
  return {
    intro: () => getRandom<string>(data.newDay, 1)[0],
    broken: (target, owner) =>
      FormatOwner(
        owner,
        FormatTarget(target, getRandom<string>(data.brokenNight.event, 1)[0])
      ),
    noOwnerLeft: (target) =>
      FormatTarget(
        target,
        getRandom<string>(data.brokenNight.noOwnerLeft, 1)[0]
      ),
    noBroken: () => getRandom<string>(data.brokenNight.none, 1)[0],
    roles,
    none: (target) =>
      FormatTarget(target, getRandom<string>(townieData.reveal, 1)[0]),
    unknown: (player, roleList) =>
      `It appears <@${player.id}> was a ${roleList.join(", ")}.`,
  };
}

export function getHypnotistFlavour(folderName: string): HypnotistFlavourList {
  const data = LoadYamlFile(path.join(folderName, "hypnotist.yaml"));
  return {
    intro: (playerList, voteList) =>
      FormatPlayerList(
        playerList,
        getRandom<string>(data.intro, 1)[0]
          .replace(
            /\[command.vote\]/gi,
            `\`${PREFIX} vote <name>\` or \`${PREFIX} vote-nb <number>\``
          )
          .replace(/\[command\.no_vote\]/gi, `\`${PREFIX} no-vote\``)
      ).replace(/\[voteList\]/gi, `\n${voteList.join("\n")}`),
    vote: LoadVoteFlavour(data.vote),
    breakTist: LoadToggledData(
      data.action.break.self,
      (
        rawData: { target: string[]; player: string[] } | string[],
        target: PlayerData,
        owner: PlayerData,
        count: number
      ) =>
        FormatOwner(
          owner,
          FormatTarget(
            target,
            getRandom<string>(
              (<any>rawData).player
                ? ((<any>rawData).player as string[])
                : (rawData as string[]),
              1
            )[0]
          )
        ).replace(/\[hypnotistCount\]/gi, `${count}`)
    ),
    brokenTist: LoadToggledData(
      data.action.break.self,
      (
        rawData: { target: string[]; player: string[] } | string[],
        target: PlayerData,
        owner: PlayerData,
        count: number
      ) =>
        FormatOwner(
          owner,
          FormatTarget(
            target,
            getRandom<string>(
              (<any>rawData).target
                ? ((<any>rawData).target as string[])
                : (rawData as string[]),
              1
            )[0]
          )
        ).replace(/\[hypnotistCount\]/gi, `${count}`)
    ),
    breakOther: LoadToggledData(
      data.action.break.other,
      (
        rawData: string[],
        target: PlayerData,
        owner: PlayerData,
        count: number
      ) =>
        FormatOwner(
          owner,
          FormatTarget(target, getRandom(rawData, 1)[0])
        ).replace(/\[hypnotistCount\]/gi, `${count}`)
    ),
    dissent: LoadToggledData(
      data.action.skip.dissent,
      (rawData: string[], playerList) =>
        FormatPlayerList(playerList, getRandom(rawData, 1)[0])
    ),
    noVote: LoadToggledData(
      data.action.skip.noVote,
      (rawData: string[], playerList) =>
        FormatPlayerList(playerList, getRandom(rawData, 1)[0])
    ),
  };
}

export function getDeprogrammerFlavour(
  folderName: string
): DeprogrammerFlavourList {
  const data = LoadYamlFile(path.join(folderName, "deprogrammer.yaml"));
  return {
    intro_break_enabled: (voteList: string[]) =>
      getRandom<string>(data.intro.break.enabled, 1)[0]
        .replace(/\[voteList\]/gi, `\n${voteList.join(" ")}`)
        .replace(
          /\[command\.break\]/gi,
          `\`${PREFIX} break <name>\` or \`${PREFIX} break-nb <number>\``
        ),
    intro_break_disabled: () =>
      getRandom<string>(data.intro.break.disabled, 1)[0],
    intro_save_enabled: (voteList: string[]) =>
      getRandom<string>(data.intro.save.enabled, 1)[0]
        .replace(/\[voteList\]/gi, `\n${voteList.join("\n")}`)
        .replace(
          /\[command\.save\]/gi,
          `\`${PREFIX} save <name>\` or \`${PREFIX} save-nb <number>\``
        ),
    intro_save_useless: () => getRandom<string>(data.intro.save.unneeded, 1)[0],
    intro_save_disabled: () =>
      getRandom<string>(data.intro.save.disabled, 1)[0],
    intro_skip: () =>
      getRandom<string>(data.intro.skip, 1)[0].replace(
        /\[command\.skip\]/gi,
        `\`${PREFIX} skip\``
      ),
    break: (target) =>
      FormatTarget(target, getRandom<string>(data.action.break, 1)[0]),
    save: (target) =>
      FormatTarget(target, getRandom<string>(data.action.save, 1)[0]),
    skip: () => getRandom<string>(data.action.skip, 1)[0],
    timeout: () => getRandom<string>(data.action.timeout, 1)[0],
  };
}

export function getDetectiveFlavour(folderName: string): DetectiveFlavourList {
  const data = LoadYamlFile(path.join(folderName, "detective.yaml"));
  const spy: {
    [role: string]: (target: PlayerData, roleList: string[]) => string;
  } = {};
  for (const key of Object.keys(data.action.spy)) {
    const reveal = data.action.spy[key];
    spy[key] = (target, roleList) =>
      FormatTarget(target, getRandom<string>(reveal, 1)[0]).replace(
        /\[roleList\]/gi,
        roleList.join(", ")
      );
  }
  return {
    intro: (voteList: string[]) =>
      getRandom<string>(data.intro, 1)[0]
        .replace(/\[voteList\]/gi, `\n${voteList.join(" ")}`)
        .replace(
          /\[command\.spy\]/gi,
          `\`${PREFIX} spy <name>\` or \`${PREFIX} spy-nb <number>\``
        )
        .replace(/\[command\.skip\]/gi, `\`${PREFIX} skip\``),
    spy,
    skip: () => getRandom<string>(data.action.skip, 1)[0],
    timeout: () => getRandom<string>(data.action.timeout, 1)[0],
  };
}

export function getJesterFlavour(folderName: string): JesterEndingFlavour {
  const data = LoadYamlFile(path.join(folderName, "jester.yaml"));
  return {
    jester: LoadToggledData(
      data.victory,
      (rawData: string[], playerList, allPlayerList, hypnotistList) =>
        FormatPlayerList(playerList, getRandom(rawData, 1)[0])
          .replace(
            /\[allMention\]/gi,
            allPlayerList.map((p) => `<@${p.id}>`).join(" ")
          )
          .replace(
            /\[hypnotistList\]/gi,
            hypnotistList.map((p) => p.nickname).join(", ")
          )
    ),
  };
}

export function getFlavourFromFolder(folderName: string): FlavourEntry {
  return {
    baseDay: getBaseDayFlavour(folderName),
    baseNight: getBaseNightFlavour(folderName),
    checkEnd: getCheckEndFlavour(folderName),
    notifyRoles: getNotifyFlavour(folderName),
    resolveBroken: getResolveBrokenFlavour(folderName),
    mumble: getMumbleFlavour(folderName),
    handleHypnotist: getHypnotistFlavour(folderName),
    handleDeprogrammer: getDeprogrammerFlavour(folderName),
    handleDetective: getDetectiveFlavour(folderName),
    handleJester: getJesterFlavour(folderName),
  };
}

export function getFlavourList(): FlavourEntry[] {
  return [getFlavourFromFolder("strings/classic/")];
}
