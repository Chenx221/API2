import fs from "fs";
import csv from "csv-parser";
import {fileURLToPath} from "url";
import path from "path";

let cachedVersions = null;
let lastLoadTime = 0;
const CACHE_TTL = 10 * 1000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const csvPath = path.join(__dirname, "../data/versions.csv");

async function loadVersionsFromCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (data) => results.push(data))
            .on("end", () => {
                const versionMap = {};
                for (const row of results) {
                    const key = row.sha256.trim().toLowerCase();
                    versionMap[key] = {
                        compiler: row.compiler,
                        arch: row.arch,
                        release_date: row.release_date,
                        download_url: row.download_url
                    };
                }
                resolve(versionMap);
            })
            .on("error", reject);
    });
}

export async function getVersionMap(skipCache = false) {
    const now = Date.now();
    if (skipCache || !cachedVersions || now - lastLoadTime > CACHE_TTL) {
        cachedVersions = await loadVersionsFromCSV(csvPath);
        lastLoadTime = now;
    }
    return cachedVersions;
}