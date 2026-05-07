import express from "express";
import * as cheerio from "cheerio";
import axios from "axios";
import { generateContent } from "../services/groqService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { url, style, platform } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // 1. Scrape the URL
    console.log(`Scraping URL: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // 2. Extract common eCommerce data
    const title = $('h1').first().text().trim() || $('title').text().trim();
    
    // Attempt to extract descriptions and prices (very broad selectors)
    let description = "";
    $('[class*="description"], [id*="description"], p').each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 20 && text.length < 500 && description.length < 500) {
        description += text + " ";
      }
    });

    // Clean up
    const productData = `Product: ${title}. Details: ${description.substring(0, 500)}`;
    console.log(`Scraped Data: ${productData}`);

    // 3. Send to Groq for generation
    console.log(`Generating content based on scraped data...`);
    const result = await generateContent(productData, style, platform);
    
    res.json({
      scrapedData: productData,
      ...result
    });

  } catch (error) {
    console.error("Scraping/Generation Error:", error.message);
    res.status(500).json({ error: "Failed to scrape URL or generate content. Ensure the URL is valid and accessible." });
  }
});

export default router;
