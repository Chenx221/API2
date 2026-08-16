import fs from "fs";
import {fileURLToPath} from "url";
import path from "path";

let cachedLatest = null;
let lastLoadTime = 0;
const CACHE_TTL = 10 * 1000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.join(__dirname, "../data/latestVersions.json");

async function loadLatestFromJSON(filePath) {
    const raw = await fs.promises.readFile(filePath, "utf8");
    return JSON.parse(raw);
}

export async function getLatestVersionMap(skipCache = false) {
    const now = Date.now();
    if (skipCache || !cachedLatest || now - lastLoadTime > CACHE_TTL) {
        cachedLatest = await loadLatestFromJSON(jsonPath);
        lastLoadTime = now;
    }
    return cachedLatest;
}
