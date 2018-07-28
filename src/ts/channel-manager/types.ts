import * as discord from "discord.js";
import * as moment from "moment";
import { TimeoutPromise } from "../utils/timer";
import { DiscordGameCreator } from "../game-creator/discord";
import { GameData } from "../game";

export type NotStartedGameChannelData = {
    type: "NOT_STARTED",
    channel: discord.TextChannel,
};
export type CreatingGameChannelData = {
    type: "CREATING",
    channel: discord.TextChannel,
    createdDate: moment.Moment,
    creator: DiscordGameCreator,
    timeout: TimeoutPromise,
};
export type RunningGameChannelData = {
    type: "RUNNING",
    channel: discord.TextChannel,
    createdDate: moment.Moment,
    game: GameData,
};

export type RegisteredGameChannelData =
NotStartedGameChannelData
| CreatingGameChannelData
| RunningGameChannelData;

export type ManagerContext = {
    channelList: RegisteredGameChannelData[],
};
