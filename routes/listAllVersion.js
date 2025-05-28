import express from "express";
import {getVersionMap} from "../utils/parseVersions.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const versionMap = await getVersionMap();
        const versions = Object.entries(versionMap).map(([sha256, info]) => ({
            sha256,
            ...info
        }));

        res.render('allVersions', {
            title: 'All Available Versions',
            versions: versions
        });
    } catch (error) {
        console.error("Failed to fetch versions:", error);
        res.status(500).render('error', {
            message: 'Failed to retrieve version information',
            error: req.app.get('env') === 'development' ? error : {}
        });
    }
});

export default router;