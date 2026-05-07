# 💎 AI TikTok Content Generator for Jewellery Sellers

A fully functional, premium MVP designed to generate viral hooks, emotional captions, and trending hashtags for jewellery brands in seconds. Built with a modern tech stack and powered by the Groq AI API.

## 🚀 Features (Upgraded)

1. **🎨 Style Selector**: Choose the tone of your content:
   - **💎 Luxury**: Aspirational, exclusive, and high-end.
   - **🔥 Viral**: Bold, punchy, and designed for shares.
   - **💕 Emotional**: Story-driven and heartfelt.
   - **😂 Funny**: Witty, relatable, and engaging.
2. **📱 Platform Selector**: Optimize content specifically for **TikTok**, **Instagram Reels**, or **YouTube Shorts**.
3. **📋 Advanced Copy Functionality**:
   - **Individual Copy Buttons**: Copy single hooks, the entire caption, or all hashtags with one click.
   - **Click-to-Copy Hashtags**: Simply click any individual hashtag chip to copy it to your clipboard.
4. **🕓 History Panel**:
   - Automatically saves your last 20 generations locally in your browser.
   - Instantly reload previous generations with one click.
   - Clear history button.
5. **✨ Premium UI/UX**:
   - Stunning glassmorphic dark-mode design.
   - Smooth `framer-motion` animations.
   - Character counter for captions.

---

## 🧱 Repository Structure

```text
tiktok-ai-tool/
│
├── frontend/        # Next.js 15 (App Router), Framer Motion, Lucide React
├── backend/         # Node.js, Express, Groq SDK
├── .env             # Environment variables (API Keys)
└── README.md        # Project documentation
```

---

## ⚙️ How to Run Locally

### 1. Configure the Environment
Ensure your `.env` file in the root directory contains your Groq API Key:
```env
GROQ_API_KEY=your_groq_api_key_here
```

### 2. Start the Backend (API)
Open a terminal and run:
```bash
cd backend
npm install
npm run dev
```
*The backend will run on `http://localhost:5000`*

### 3. Start the Frontend (UI)
Open a new terminal and run:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:3000`*

---

## 🛠️ Tech Stack

- **Frontend**: Next.js (React), CSS Modules (Custom Glassmorphism CSS), Framer Motion, Lucide Icons.
- **Backend**: Express.js, Node.js, Groq SDK.
- **AI Model**: `llama-3.3-70b-versatile` (via Groq API for blazing fast inference).

---

## 🚀 Deployment Guide

### Frontend → Vercel
1. Push this repository to GitHub.
2. Import the `frontend` folder into Vercel.
3. Deploy.

### Backend → Railway (or Render)
1. Upload the `backend` folder to Railway.
2. Add the `GROQ_API_KEY` to the environment variables in the Railway dashboard.
3. Deploy.
4. Update the frontend `fetch` URL in `app/page.tsx` from `http://localhost:5000/generate` to your new live backend URL.

---
*Built with ❤️ for Jewellery Brands to go Viral.*
