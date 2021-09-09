import { PlayerData, PlayerInterface } from "../../ts/game/data/player";
import { HYPNOTIST_ROLE, handleHypnotist } from "../../ts/roles/hypnotist";
import {
  handleDeprogrammer,
  DEPROGRAMMER_ROLE,
} from "../../ts/roles/deprogrammer";
import { handleDetective, DETECTIVE_ROLE } from "../../ts/roles/detective";
import { Game } from "../../ts/game";
import { TimerPromise } from "../../ts/utils/timer";
import { checkEndWithJester, JESTER_ROLE } from "../../ts/roles/jester";

export function GameCreator(
  privateMessage: (id: string, message: string) => void
) {
  let players: PlayerData[] = [];
  let playerInterface: PlayerInterface = {};
  return {
    addPlayer(id: string) {
      if (players.filter((p) => p.id === id).length) {
        return false;
      }
      players.push({
        id,
        username: id,
        nickname: id,
        attributes: [],
        roles: [],
      });
      playerInterface[id] = {
        async sendMessage(message: string) {
          privateMessage(id, message);
        },
      };
      return true;
    },
    removePlayer(id: string) {
      if (players.filter((p) => p.id === id).length) {
        return false;
      }
      players = players.filter((p) => p.id !== id);
      delete playerInterface[id];
      return true;
    },
    players() {
      return players;
    },
    playerInterface() {
      return playerInterface;
    },
  };
}

export async function runGame(
  players: number,
  messages: Array<
    | {
        type: "simple";
        player: number;
        command: string;
        private: boolean;
        original: string;
      }
    | {
        type: "target";
        player: number;
        command: string;
        target: number;
        private: boolean;
        original: string;
      }
    | {
        type: "target_pos";
        player: number;
        command: string;
        target: number;
        private: boolean;
        original: string;
      }
  >,
  roles: {
    tists: number;
    deprogs?: number;
    detectives?: number;
    jesters?: number;
  },
  params: { allowMumble?: boolean; log?: boolean } = {}
) {
  const replies: string[] = [];
  let mumbles = 0;

  const gameCreator = GameCreator(async (id, message) =>
    replies.push(`${id} > ${message}`)
  );
  for (let i = 0; i < players; i++) {
    gameCreator.addPlayer(`${i + 1}`);
  }
  const createdPlayers = gameCreator.players();
  for (let i = 0; i < roles.tists; i++) {
    createdPlayers[i].roles.push(HYPNOTIST_ROLE);
  }
  if (roles.deprogs) {
    for (let i = 0; i < roles.deprogs; i++) {
      createdPlayers[i + roles.tists].roles.push(DEPROGRAMMER_ROLE);
    }
  }
  if (roles.detectives) {
    for (let i = 0; i < roles.detectives; i++) {
      createdPlayers[i + roles.tists + (roles.deprogs || 0)].roles.push(
        DETECTIVE_ROLE
      );
    }
  }
  if (roles.jesters) {
    for (let i = 0; i < roles.jesters; i++) {
      createdPlayers[
        i + roles.tists + (roles.deprogs || 0) + (roles.detectives || 0)
      ].roles.push(JESTER_ROLE);
    }
  }
  if (params.log) {
    console.log(createdPlayers.map((p) => `${p.id} ${p.roles[0]}`).join(", "));
  }
  let sendMessage = async (m: string) => {
    replies.push(`general > ${m}`);
  };
  let game = Game(
    createdPlayers,
    sendMessage,
    gameCreator.playerInterface(),
    async (m) => {
      mumbles += 1;
      return !!params.allowMumble;
    },
    createdPlayers.length > 10
  );
  game.subscribeNightRole(handleHypnotist({}));
  game.subscribeNightRole(handleDeprogrammer({}));
  game.subscribeNightRole(handleDetective({}));
  game.setCheckEnd(checkEndWithJester({}, {}));
  const runningGame = game.start();
  for (const message of messages) {
    await TimerPromise(1);
    replies.push(`${message.original}`);
    if (message.type === "simple") {
      game.handleCommand(message.command, `${message.player}`, {
        author: `${message.player}`,
        private: message.private,
        content: message.original,
      });
    } else if (message.type === "target") {
      game.handleTargettingCommand(
        message.command,
        `${message.player}`,
        { type: "id", content: `${message.target}` },
        {
          author: `${message.player}`,
          private: message.private,
          content: message.original,
        }
      );
    } else if (message.type === "target_pos") {
      game.handleTargettingCommand(
        message.command,
        `${message.player}`,
        { type: "index", content: message.target },
        {
          author: `${message.player}`,
          private: message.private,
          content: message.original,
        }
      );
    }
  }
  if (params.log) {
    console.log(replies.join("\n"));
  }
  await runningGame;
  return { replies, mumbles };
}
