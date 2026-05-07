import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateContent(product, style = "luxury", platform = "tiktok") {
  const platformContext = {
    tiktok: "TikTok (short-form, fast-paced, Gen Z + Millennials)",
    instagram: "Instagram Reels (aesthetic, lifestyle-focused)",
    youtube: "YouTube Shorts (slightly longer, story-driven)",
  };

  const styleContext = {
    luxury: "ultra-premium, aspirational, exclusive — speak to desire and status",
    viral: "bold, punchy, scroll-stopping — designed to get shares and comments",
    emotional: "heartfelt, personal story-driven — connects on a deep emotional level",
    funny: "witty, playful, relatable — uses humour to drive engagement",
  };

  const prompt = `
You are an elite TikTok content strategist specialising in luxury jewellery brands for the UK and USA markets.

Generate content for the following product in ${styleContext[style] || styleContext.luxury} style, optimised for ${platformContext[platform] || platformContext.tiktok}.

Product: ${product}

Return ONLY a valid raw JSON object — no markdown fences, no explanation, no extra text. Use this exact structure:
{
  "hooks": ["hook 1 text", "hook 2 text", "hook 3 text"],
  "caption": "full caption text here",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5", "#hashtag6", "#hashtag7", "#hashtag8", "#hashtag9", "#hashtag10"]
}
`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
    });

    const raw = response.choices[0].message.content.trim();

    // Extract JSON from response (in case model adds any wrapper text)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON found in response");

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      hooks: parsed.hooks || [],
      caption: parsed.caption || "",
      hashtags: parsed.hashtags || [],
    };
  } catch (error) {
    console.error("Groq API Error:", error);
    throw error;
  }
}

export async function researchHashtags(query) {
  const prompt = `
You are an expert social media analyst for the jewellery industry.
Perform deep hashtag research for this topic: "${query}"

Provide 25-30 relevant hashtags grouped into 3 categories:
1. **Niche**: Specific to the jewellery type/style (High conversion).
2. **Community**: Used by jewellery lovers and collectors.
3. **Broad/Trending**: High volume tags to increase reach.

Return ONLY a valid raw JSON object with this structure:
{
  "niche": ["#tag1", "#tag2", ...],
  "community": ["#tag1", "#tag2", ...],
  "broad": ["#tag1", "#tag2", ...],
  "strategy": "A brief 2-sentence tip on how to use these tags."
}
`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const raw = response.choices[0].message.content.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON found");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Hashtag Research Error:", error);
    throw error;
  }
}
