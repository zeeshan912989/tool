import { Groq } from "groq-sdk";
import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/", async (req, res) => {
  const { username, platform = "tiktok" } = req.body;
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

  if (!username) return res.status(400).json({ error: "Username is required" });
  
  const cleanUsername = username.replace("@", "");

  // API Configuration
  const USE_APIFY = Math.random() < 0.5 && process.env.APIFY_API_KEY; // 50% chance to use Apify if key exists
  
  try {
    let profilePayload;
    
    if (USE_APIFY && platform === "tiktok") {
      console.log(`Using Apify API for ${cleanUsername}`);
      // Basic Apify API Call format (using popular unofficial actor)
      // If user wants specific actor, they can modify the actor ID
      const apifyActorUrl = `https://api.apify.com/v2/acts/clockwork~tiktok-profile-scraper/run-sync-get-dataset-items?token=${process.env.APIFY_API_KEY}`;
      
      try {
        const apifyRes = await axios.post(apifyActorUrl, { profiles: [cleanUsername] });
        const data = apifyRes.data && apifyRes.data[0];
        
        if (!data) throw new Error("Apify returned empty dataset");
        
        profilePayload = {
          display_name: data.name || cleanUsername,
          username: data.uniqueId || cleanUsername,
          avatar_url: data.avatarUrl || "https://ui-avatars.com/api/?name=" + cleanUsername,
          follower_count: data.followers || 0,
          likes_count: data.hearts || 0,
          video_count: data.videos || 0,
          bio: data.signature || "",
          videos: [],
          is_real: true,
          source: "Apify (clockwork)",
          limits: { limit: "Unlimited", remaining: "Unlimited" }
        };
      } catch (apifyErr) {
        console.warn("Apify failed, falling back to RapidAPI...");
        // Do not throw, just let profilePayload be undefined so RapidAPI block triggers
        profilePayload = null;
      }
    } 
    
    if (!USE_APIFY || platform !== "tiktok" || !profilePayload) {
      console.log(`Fetching real data from RapidAPI (${platform}) for: ${cleanUsername}`);
      
      let options;
      if (platform === "instagram") {
        options = {
          method: 'GET',
          url: 'https://instagram-scraper-api2.p.rapidapi.com/v1/info',
          params: { username_or_id_or_url: cleanUsername },
          headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
          }
        };
      } else {
        options = {
          method: 'GET',
          url: 'https://tiktok-api23.p.rapidapi.com/api/user/info',
          params: { uniqueId: cleanUsername },
          headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com'
          }
        };
      }

      const response = await axios.request(options);
      const data = response.data;
      
      const limits = {
        limit: response.headers['x-ratelimit-requests-limit'] || 1000,
        remaining: response.headers['x-ratelimit-requests-remaining'] || "Unknown"
      };

      if (platform === "instagram") {
        const user = data.data;
        if (!user) throw new Error("Instagram user not found");
        
        profilePayload = {
          display_name: user.full_name,
          username: user.username,
          avatar_url: user.profile_pic_url,
          follower_count: user.follower_count,
          likes_count: 0,
          video_count: user.media_count,
          bio: user.biography,
          videos: [],
          is_real: true,
          source: "RapidAPI (Instagram)",
          limits
        };
      } else {
        if (!data || data.status === "failed" || data.statusCode === 10221) {
          throw new Error(data.message || "User not found or private.");
        }

        const user = data.userInfo?.user || data.user;
        const stats = data.userInfo?.stats || data.stats;
        const statsV2 = data.userInfo?.statsV2 || data.statsV2;

        if (!user || Object.keys(user).length === 0) throw new Error("Could not parse user data from API response");

        profilePayload = {
          display_name: user.nickname || user.display_name,
          username: user.uniqueId || user.username,
          avatar_url: user.avatarMedium || user.avatar_url,
          follower_count: stats.followerCount || stats.followers || 0,
          likes_count: stats.heart || statsV2?.heartCount || stats.likes || 0,
          video_count: stats.videoCount || stats.videos || 0,
          bio: user.signature || user.bio || "",
          videos: [],
          is_real: true,
          source: "RapidAPI (tiktok-api23)",
          limits
        };
      }
    }

    // AI Analysis Generation
    try {
      console.log("Generating AI Analysis for Competitor...");
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert social media strategist. Analyze the provided competitor profile and give a very brief 3-point strategy explaining why they are successful or what content strategy they likely use based on their niche and stats. Format as a clean string."
          },
          {
            role: "user",
            content: `Platform: ${platform}. Username: @${profilePayload.username}. Followers: ${profilePayload.follower_count}. Bio: "${profilePayload.bio}". Analyze them.`
          }
        ],
        model: "llama-3.3-70b-versatile",
      });

      profilePayload.ai_analysis = completion.choices[0].message.content;
    } catch (aiError) {
      console.error("AI Analysis Failed:", aiError.message);
      profilePayload.ai_analysis = "AI Analysis is currently unavailable. Please try again later.";
    }

    res.json(profilePayload);

  } catch (error) {
    console.error("RapidAPI Error:", error.response?.data || error.message);
    
    // Fallback/Demo Mode if API fails
    console.log(`Using DEMO MODE for ${platform} as RapidAPI failed.`);
    
    const demoPayload = {
      display_name: cleanUsername.toUpperCase(),
      username: cleanUsername,
      avatar_url: "https://ui-avatars.com/api/?name=" + cleanUsername + "&background=8b5cf6&color=fff&size=200",
      follower_count: Math.floor(Math.random() * 500000) + 10000,
      likes_count: Math.floor(Math.random() * 5000000) + 100000,
      video_count: Math.floor(Math.random() * 300) + 50,
      bio: "✨ Luxury Jewellery ✨ | Custom Designs | DM for orders 💎",
      videos: [],
      is_real: false,
      source: "Demo Mode (API Failed)",
      limits: { limit: 100, remaining: "0 (Using Mock)" }
    };

    // Try AI generation even with demo data
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are an expert social media strategist. Analyze this competitor and give a 3-point strategy." },
          { role: "user", content: `Platform: ${platform}. Username: @${demoPayload.username}. Followers: ${demoPayload.follower_count}.` }
        ],
        model: "llama-3.3-70b-versatile",
      });
      demoPayload.ai_analysis = completion.choices[0].message.content;
    } catch (aiError) {
      demoPayload.ai_analysis = "AI Analysis is currently unavailable in Demo Mode.";
    }

    return res.json(demoPayload);
  }
});

// New Dashboard Endpoint specifically for Client's own TikTok Account (e.g. bhaijewelers)
router.post("/dashboard", async (req, res) => {
  const { username } = req.body;
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

  if (!username) return res.status(400).json({ error: "Username is required" });
  const cleanUsername = username.replace("@", "");

  try {
    // 1. Fetch User Info to get secUid
    const infoResponse = await axios.get('https://tiktok-api23.p.rapidapi.com/api/user/info', {
      params: { uniqueId: cleanUsername },
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com'
      }
    });

    const infoData = infoResponse.data;
    if (!infoData || infoData.statusCode === 10221 || infoData.status === "failed") {
      throw new Error("TikTok user not found or private.");
    }

    const user = infoData.userInfo?.user || infoData.user;
    const stats = infoData.userInfo?.stats || infoData.stats;
    const statsV2 = infoData.userInfo?.statsV2 || infoData.statsV2;

    if (!user || !user.secUid) throw new Error("Could not parse secUid from user data");

    // 2. Fetch Latest Videos (Posts)
    const postsResponse = await axios.get('https://tiktok-api23.p.rapidapi.com/api/user/posts', {
      params: { secUid: user.secUid, count: 15 },
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com'
      }
    });

    const videos = postsResponse.data?.itemList || [];

    // 3. Calculate Analytics from Latest Videos
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    
    const parsedVideos = videos.map((v) => {
      const vStats = v.stats || v.statistics || {};
      const views = vStats.playCount || 0;
      const likes = vStats.diggCount || 0;
      const comments = vStats.commentCount || 0;
      const shares = vStats.shareCount || 0;
      
      totalViews += views;
      totalLikes += likes;
      totalComments += comments;
      totalShares += shares;
      
      return {
        id: v.id,
        desc: v.desc || "",
        cover: v.video?.cover || "",
        views,
        likes,
        comments,
        shares,
        engagement_rate: views > 0 ? ((likes + comments + shares) / views * 100).toFixed(2) : "0.00"
      };
    });

    const avgEngagementRate = totalViews > 0 ? ((totalLikes + totalComments + totalShares) / totalViews * 100).toFixed(2) : "0.00";

    // 4. AI Best Posting Time & Competitor Analysis
    let aiStrategy = {};
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert social media analyst. Based on this TikTok profile's recent data, generate a JSON object with: 1. 'best_posting_times' (string array of 3 times e.g. ['6:00 PM', ...]), 2. 'competitor_analysis' (a short 2-sentence actionable advice on what competitors are doing better), 3. 'watch_time_tip' (1 sentence tip to improve watch time)."
          },
          {
            role: "user",
            content: `Username: @${cleanUsername}. Followers: ${stats.followerCount}. Recent views: ${totalViews}. Avg Engagement: ${avgEngagementRate}%.`
          }
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });
      aiStrategy = JSON.parse(completion.choices[0].message.content);
    } catch (e) {
      aiStrategy = {
        best_posting_times: ["12:00 PM", "6:00 PM", "9:00 PM"],
        competitor_analysis: "Competitors are using faster hooks and trending audio. Consider adding text-to-speech in the first 3 seconds.",
        watch_time_tip: "Keep the suspense until the last 2 seconds to increase replay value."
      };
    }

    const payload = {
      profile: {
        display_name: user.nickname,
        username: user.uniqueId,
        avatar_url: user.avatarMedium,
        follower_count: stats.followerCount,
        likes_count: stats.heart || statsV2?.heartCount,
        video_count: stats.videoCount
      },
      analytics: {
        total_recent_views: totalViews,
        avg_engagement_rate: avgEngagementRate,
        recent_videos: parsedVideos.slice(0, 5), // top 5 most recent
        best_posting_times: aiStrategy.best_posting_times || ["12 PM", "6 PM", "9 PM"],
        competitor_analysis: aiStrategy.competitor_analysis || "",
        watch_time_tip: aiStrategy.watch_time_tip || ""
      }
    };

    res.json(payload);

  } catch (error) {
    console.error("Dashboard Scrape Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
