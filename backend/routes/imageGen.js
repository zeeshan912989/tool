import express from "express";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const router = express.Router();

// Multer: store uploads in memory for easy base64 conversion
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /image-gen/generate
router.post("/generate", upload.single("image"), async (req, res) => {
  const { prompt } = req.body;
  const imageFile = req.file;

  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

  try {
    // Build a strong product banner generation prompt
    const fullPrompt = imageFile
      ? `You are a professional product photographer and graphic designer. 
Based on this product image, create a stunning, professional marketing banner for social media (TikTok/Instagram).
The banner should feature the product prominently with a luxury aesthetic.
User instructions: ${prompt}
Make it viral, visually striking with premium dark background, bokeh lighting, and elegant composition.`
      : `Create a stunning professional jewellery product banner for social media (TikTok/Instagram).
Description: ${prompt}
Style: Luxury, premium dark background, bokeh lighting, elegant composition, high-end product photography style.
Make it viral and visually striking.`;

    // Build parts array
    const parts = [];
    if (imageFile) {
      parts.push({
        inline_data: {
          data: imageFile.buffer.toString("base64"),
          mime_type: imageFile.mimetype
        }
      });
    }
    parts.push({ text: fullPrompt });

    // Use Gemini 3.1 Flash Image Preview via REST API
    const MODEL = "gemini-3.1-flash-image-preview";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

    const payload = {
      contents: [{ parts }],
      generationConfig: {
        responseModalities: ["IMAGE"]
      }
    };

    const apiRes = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey
      },
      body: JSON.stringify(payload)
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      console.error("Gemini API Error:", JSON.stringify(data, null, 2));
      return res.status(apiRes.status).json({
        error: data?.error?.message || "Gemini API request failed",
        details: data?.error
      });
    }

    // Extract image from response
    let generatedImageBase64 = null;
    let textResponse = "";

    const parts_out = data?.candidates?.[0]?.content?.parts || [];
    for (const part of parts_out) {
      if (part.inlineData) {
        generatedImageBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      } else if (part.text) {
        textResponse = part.text;
      }
    }

    if (!generatedImageBase64) {
      return res.status(500).json({
        error: "Model did not return an image.",
        rawResponse: data
      });
    }

    return res.json({
      image: generatedImageBase64,
      description: textResponse,
      model: MODEL
    });

  } catch (error) {
    console.error("Image Gen Error:", error.message);
    return res.status(500).json({
      error: "Image generation failed: " + error.message
    });
  }
});

export default router;
