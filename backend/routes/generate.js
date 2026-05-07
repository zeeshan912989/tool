import express from "express";
import { generateContent } from "../services/groqService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { product, style, platform } = req.body;
    if (!product) {
      return res.status(400).json({ error: "Product description is required" });
    }

    const result = await generateContent(product, style, platform);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate content. Please try again." });
  }
});

export default router;
