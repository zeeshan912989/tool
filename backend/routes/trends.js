import express from "express";
import { getJson } from "serpapi";

const router = express.Router();

router.post("/", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Search query is required" });

  try {
    getJson({
      engine: "google_trends",
      q: query,
      date: "today 12-m",
      tz: "420",
      data_type: "TIMESERIES",
      api_key: "649b4064070ed35cf7e6f4e540152cf90712ef8f4fc097d11296c54cf34de4cc"
    }, (json) => {
      if (json.error) {
        return res.status(500).json({ error: json.error });
      }
      res.json({ trend: json.interest_over_time?.timeline_data || [] });
    });
  } catch (error) {
    console.error("Trends API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch Google Trends data." });
  }
});

export default router;
