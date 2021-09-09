import * as fs from "fs";
import * as jsonfile from "jsonfile";
import { StatsData } from ".";
import { STATS_FILE_PATH } from "../config";

export function getStatsFromFile(): StatsData {
  if (!STATS_FILE_PATH) return { excluded: [], names: {}, saved: {} };
  if (!fs.existsSync(STATS_FILE_PATH))
    return { excluded: [], names: {}, saved: {} };
  const stats = jsonfile.readFileSync(STATS_FILE_PATH) as StatsData;
  if (!stats.excluded) stats.excluded = [];
  if (!stats.names) stats.names = {};
  if (!stats.saved) stats.saved = {};
  return stats;
}

export function saveStatsToFile(data: StatsData) {
  if (!STATS_FILE_PATH) return;
  if (fs.existsSync(STATS_FILE_PATH)) {
    fs.unlinkSync(STATS_FILE_PATH);
  }
  jsonfile.writeFileSync(STATS_FILE_PATH, data, { spaces: 2, EOL: "\r\n" });
}
