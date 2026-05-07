import express from "express";
import { getJson } from "serpapi";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const router = express.Router();

router.post("/", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Search query is required" });

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) return res.status(500).json({ error: "SERPAPI_KEY not configured" });

  try {
    const data = await new Promise((resolve, reject) => {
      getJson({
        engine: "google_trends",
        q: query,
        date: "today 12-m",
        tz: "420",
        data_type: "TIMESERIES",
        api_key: apiKey
      }, (json) => {
        if (json.error) {
          reject(new Error(json.error));
        } else {
          resolve(json);
        }
      });
    });

    res.json({ trend: data.interest_over_time?.timeline_data || [] });
  } catch (error) {
    console.error("Trends API Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch Google Trends data." });
  }
});

export default router;
