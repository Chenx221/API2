import express from "express";
import {getLatestVersionMap} from "../utils/parseLatestVersions.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const latestMap = await getLatestVersionMap();
        return res.json(latestMap);
    } catch (err) {
        console.error("checkLatest error:", err);
        res.status(500).json({error: "Internal server error"});
    }
});

export default router;
