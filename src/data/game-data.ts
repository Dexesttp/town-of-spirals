import { User } from "discord.js";

export const gameData: {
	phase: "day" | "night",
	hypnotists: User[],
	recentlyBadoozled: User[],
	badoozledPlayers: User[],
	votes: {[key: string] : string},
} = {
	phase: null,
	hypnotists: [],
	recentlyBadoozled: [],
	badoozledPlayers: [],
	votes: {},
};