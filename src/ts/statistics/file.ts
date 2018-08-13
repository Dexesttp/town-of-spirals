import * as fs from "fs";
import * as jsonfile from "jsonfile";
import { StatsData } from ".";
import { STATS_FILE_PATH } from "../config";

export function getStatsFromFile(): StatsData {
    if (!STATS_FILE_PATH) return { excluded: [], saved: {} };
    if (!fs.existsSync(STATS_FILE_PATH)) return { excluded: [], saved: {} };
    return jsonfile.readFileSync(STATS_FILE_PATH) as StatsData;
}

export function saveStatsToFile(data: StatsData) {
    if (!STATS_FILE_PATH) return;
    if (fs.existsSync(STATS_FILE_PATH)) {
        fs.unlinkSync(STATS_FILE_PATH);
    }
    fs.writeFileSync(STATS_FILE_PATH, JSON.stringify(data));
}
