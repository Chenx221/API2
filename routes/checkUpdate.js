import express from "express";
import {getVersionMap} from "../utils/parseVersions.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const {sha256, noCache} = req.query;

    if (!sha256) {
        return res.status(400).json({error: "Missing required parameter: sha256"});
    }

    try {
        const versionMap = await getVersionMap(noCache === 'true');
        const entries = Object.entries(versionMap);
        const normalized = sha256.trim().toLowerCase();
        const current = versionMap[normalized];

        if (!current) {
            const entriesByDate = [...entries];
            entriesByDate.sort((a, b) => new Date(b[1].release_date) - new Date(a[1].release_date));

            const latestVS2019 = entriesByDate.find(([_, meta]) => meta.compiler === 'vs2019');

            const latest = latestVS2019 || entriesByDate[0];

            if (!latest) {
                return res.status(404).json({error: "No versions available"});
            }

            const [, meta] = latest;
            return res.json({
                update: true,
                current_release_date: "unknown",
                ...meta
            });
        }

        const filtered = entries.filter(
            ([, meta]) => meta.compiler === current.compiler && meta.arch === current.arch
        );

        const latestDate = filtered.reduce((latest, [, meta]) => {
            const date = new Date(meta.release_date).getTime();
            return date > latest ? date : latest;
        }, 0);

        const currentDate = new Date(current.release_date).getTime();

        if (currentDate === latestDate) {
            return res.json({update: false, message: "Already up-to-date"});
        }

        const latest = filtered.find(([, meta]) => new Date(meta.release_date).getTime() === latestDate);
        const [, meta] = latest;

        return res.json({
            update: true,
            current_release_date: current.release_date,
            ...meta
        });
    } catch (err) {
        console.error("checkUpdate error:", err);
        res.status(500).json({error: "Internal server error"});
    }
});

export default router;