import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const router = express.Router();

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || "http://localhost:5000/tiktok/callback";

// In-memory token store
let userToken = null;

// Mock Data for Demo Purposes
const MOCK_DATA = {
  profile: {
    display_name: "Diamond Luxury (Demo)",
    username: "diamond_luxury_jewels",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=diamond",
    follower_count: 12500,
    likes_count: 450000,
    video_count: 142
  },
  videos: [
    { id: "v1", title: "Handmade Gold Ring Process ✨", views: 250000, likes: 42000, comments: 850 },
    { id: "v2", title: "Which diamond cut is your favorite? 💎", views: 120000, likes: 15000, comments: 420 },
    { id: "v3", title: "Packing a $5000 order! 📦", views: 85000, likes: 5400, comments: 120 }
  ],
  is_demo: true
};

// 1. Auth URL
router.get("/auth", (req, res) => {
  if (!CLIENT_KEY) {
    return res.status(400).json({ error: "TIKTOK_CLIENT_KEY is missing in .env. Using Demo Mode for UI preview." });
  }

  const csrfState = Math.random().toString(36).substring(7);
  const scope = "user.info.basic,video.list,video.stats";
  const authUrl = `https://www.tiktok.com/v2/auth/authorize/` +
    `?client_key=${CLIENT_KEY}` +
    `&scope=${scope}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&state=${csrfState}`;

  res.json({ url: authUrl });
});

// 2. Callback
router.get("/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect("http://localhost:3000?error=auth_failed");

  try {
    const response = await axios.post(
      "https://open.tiktokapis.com/v2/oauth/token/",
      new URLSearchParams({
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (response.data.access_token) {
      userToken = response.data.access_token;
      res.redirect("http://localhost:3000?connected=true");
    } else {
      res.redirect("http://localhost:3000?error=token_error");
    }
  } catch (error) {
    res.redirect("http://localhost:3000?error=server_error");
  }
});

// 3. Unified Data Fetch (Profile + Analytics)
router.get("/analytics", async (req, res) => {
  // If no token, return Mock Data for UI demonstration
  if (!userToken) {
    return res.json(MOCK_DATA);
  }

  try {
    const profileRes = await axios.get(
      "https://open.tiktokapis.com/v2/user/info/?fields=display_name,username,avatar_url,follower_count,likes_count,video_count",
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    const videosRes = await axios.post(
      "https://open.tiktokapis.com/v2/video/list/?fields=id,title,view_count,like_count,comment_count,share_count",
      { max_count: 10 },
      { headers: { Authorization: `Bearer ${userToken}`, "Content-Type": "application/json" } }
    );

    res.json({
      profile: profileRes.data.data.user,
      videos: (videosRes.data.data.videos || []).map(v => ({
        id: v.id,
        title: v.title,
        views: v.view_count,
        likes: v.like_count,
        comments: v.comment_count
      })),
      is_demo: false
    });
  } catch (error) {
    console.error("TikTok API Error, falling back to Demo Mode");
    res.json(MOCK_DATA);
  }
});

router.post("/logout", (req, res) => {
  userToken = null;
  res.json({ success: true });
});

export default router;
