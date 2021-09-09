import { GameContext } from "../game/data/context";
import { PlayerData } from "../game/data/player";
import { BROKEN_NIGHT } from "../game/data/player-states";
import { GameTools } from "../game/data/tools";
import { GetAlivePlayers } from "../game/utils/alive-players";
import { callUntilResolved } from "../utils/promise-until-resolved";
import { TimerPromise } from "../utils/timer";

export const DEPROGRAMMER_ROLE = "deprogrammer";

export const ATTRIBUTES = {
  HAS_BROKEN: "has_broken",
  HAS_SAVED: "has_saved",
  SAVED: "saved",
};

export const COMMANDS = {
  BREAK: "break",
  SAVE: "save",
  SKIP: "skip",
};

type DeprogrammingCommandResult =
  | {
      command: "timeout";
    }
  | {
      playerID: string;
      command: "skip";
    }
  | {
      playerID: string;
      targetID: string | null | undefined;
      command: "break";
    }
  | {
      playerID: string;
      targetID: string | null | undefined;
      command: "save";
    };

export type DeprogrammerFlavourList = {
  intro_save_enabled?: (voteList: string[]) => string;
  intro_save_useless?: () => string;
  intro_save_disabled?: () => string;
  intro_break_enabled?: (voteList: string[]) => string;
  intro_break_disabled?: () => string;
  intro_skip?: () => string;
  save?: (target: PlayerData) => string;
  break?: (target: PlayerData) => string;
  skip?: () => string;
  timeout?: () => string;
};

export function handleDeprogrammer(
  flavour: DeprogrammerFlavourList,
  timeout = 120000
) {
  return async (context: GameContext, tools: GameTools) => {
    const deprogrammers = GetAlivePlayers(context).filter((p) =>
      p.roles.some((r) => r === DEPROGRAMMER_ROLE)
    );
    const results: { [id: string]: DeprogrammingCommandResult } = {};
    for (const deprogrammer of deprogrammers) {
      const promises: Array<Promise<DeprogrammingCommandResult>> = [];
      const deprogrammerInterface = context.playerInterface[deprogrammer.id];

      //#region Timeout
      const timeoutPromise = TimerPromise(
        timeout
      ).then<DeprogrammingCommandResult>((r) => ({ command: "timeout" }));
      promises.push(timeoutPromise);
      //#endregion

      //#region Break
      const canBreak = !deprogrammer.attributes.some(
        (a) => a === ATTRIBUTES.HAS_BROKEN
      );
      if (canBreak) {
        const targets = GetAlivePlayers(context).filter(
          (p) => !p.attributes.some((a) => a === BROKEN_NIGHT)
        );
        const breakPromise = callUntilResolved(() =>
          tools.getTargettingCommandPromise(
            COMMANDS.BREAK,
            [deprogrammer],
            targets,
            true
          )
        ).then<DeprogrammingCommandResult>((r) => ({ command: "break", ...r }));
        promises.push(breakPromise);
        const voteList = targets.map(
          (t, i) => `[${i + 1}] ${t.nickname} (${t.username})`
        );
        const getIntroBreakEnabled =
          flavour.intro_break_enabled ||
          ((voteListInt: string[]) =>
            `You can break somebody with \`!s break\` : ${voteListInt.join(
              ", "
            )}`);
        deprogrammerInterface.sendMessage(getIntroBreakEnabled(voteList));
      } else {
        const getIntroBreakDisabled =
          flavour.intro_break_disabled ||
          (() => `You cannot break any more people`);
        deprogrammerInterface.sendMessage(getIntroBreakDisabled());
      }
      //#endregion

      //#region Save
      const canSave = !deprogrammer.attributes.some(
        (a) => a === ATTRIBUTES.HAS_SAVED
      );
      if (canSave) {
        const recentlyBrokenPlayers = GetAlivePlayers(context).filter((p) =>
          p.attributes.some((a) => a === BROKEN_NIGHT)
        );
        if (recentlyBrokenPlayers.length) {
          const savePromise = callUntilResolved(() =>
            tools.getTargettingCommandPromise(
              COMMANDS.SAVE,
              [deprogrammer],
              recentlyBrokenPlayers,
              true
            )
          ).then<DeprogrammingCommandResult>((r) => ({
            command: "save",
            ...r,
          }));
          promises.push(savePromise);
          const voteList = recentlyBrokenPlayers.map(
            (t, i) => `[${i + 1}] ${t.nickname} (${t.username})`
          );
          const getIntroSaveEnabled =
            flavour.intro_save_enabled ||
            ((voteListInt: string[]) =>
              `You can save somebody with \`!s save\` : ${voteListInt.join(
                ", "
              )}`);
          deprogrammerInterface.sendMessage(getIntroSaveEnabled(voteList));
        } else {
          const getIntroSaveUseless =
            flavour.intro_save_useless ||
            (() => `Nobody seems to need saving tonight`);
          deprogrammerInterface.sendMessage(getIntroSaveUseless());
        }
      } else {
        const getIntroSaveDisabled =
          flavour.intro_save_disabled ||
          (() => `You cannot save any more people`);
        deprogrammerInterface.sendMessage(getIntroSaveDisabled());
      }
      //#endregion

      //#region Skip
      const skipPromise = callUntilResolved(() =>
        tools.getCommandPromise(COMMANDS.SKIP, [deprogrammer], true)
      ).then<DeprogrammingCommandResult>((r) => ({
        command: "skip",
        playerID: r.playerID,
      }));
      promises.push(skipPromise);
      const getIntroSkip =
        flavour.intro_skip ||
        (() => `You can skip tonight's action with \`!s skip\`.`);
      deprogrammerInterface.sendMessage(getIntroSkip());
      //#endregion

      const result = await Promise.race(promises);
      tools.cleanSubscribedCommands();
      tools.cleanSubscribedTargettingCommands();

      results[deprogrammer.id] = result;

      if (result.command === "break") {
        const target = context.players.filter(
          (p) => p.id === result.targetID
        )[0];
        target.attributes.push(BROKEN_NIGHT);
        deprogrammer.attributes.push(ATTRIBUTES.HAS_BROKEN);
        const getBreakFlavour =
          flavour.break ||
          ((targetInt: PlayerData) => `You broke ${targetInt.nickname}.`);
        deprogrammerInterface.sendMessage(getBreakFlavour(target));
        continue;
      }
      if (result.command === "save") {
        const target = context.players.filter(
          (p) => p.id === result.targetID
        )[0];
        target.attributes = target.attributes.filter((a) => a !== BROKEN_NIGHT);
        target.attributes.push(ATTRIBUTES.SAVED);
        deprogrammer.attributes.push(ATTRIBUTES.HAS_SAVED);
        const getSaveFlavour =
          flavour.save ||
          ((targetInt: PlayerData) => `You saved ${targetInt.nickname}.`);
        deprogrammerInterface.sendMessage(getSaveFlavour(target));
        continue;
      }
      if (result.command === "skip") {
        const getSkipFlavour =
          flavour.skip || (() => `You didn't do anything.`);
        deprogrammerInterface.sendMessage(getSkipFlavour());
        continue;
      }
      const getTimeoutFlavour =
        flavour.timeout ||
        (() => `Time ran out and you didn't have time to do anything.`);
      deprogrammerInterface.sendMessage(getTimeoutFlavour());
      continue;
    }
    return results;
  };
}
