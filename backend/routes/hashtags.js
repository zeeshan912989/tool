import express from "express";
import { researchHashtags } from "../services/groqService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    const results = await researchHashtags(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Failed to research hashtags" });
  }
});

export default router;
