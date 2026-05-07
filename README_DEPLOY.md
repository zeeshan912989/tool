# Vercel Deployment Guide

To deploy this full-stack application to Vercel, follow these steps:

## 1. Deploy the Backend (API)
The backend is a separate Express app.
1. Go to the `backend` directory.
2. Run `vercel`.
3. Set up the project (name it `tiktok-ai-backend` or similar).
4. Add the following environment variables in the Vercel Dashboard:
   - `GEMINI_API_KEY`
   - `GROQ_API_KEY`
   - `RAPIDAPI_KEY`
   - `APIFY_API_KEY`
   - `FRONTEND_URL` = `https://tool-tan-nine.vercel.app`
   - `TIKTOK_REDIRECT_URI` = `https://tiktok-ai-backend-seven.vercel.app/tiktok/callback`
   - `NODE_ENV` = `production`
5. Once deployed, copy the **Backend URL** (e.g., `https://your-backend.vercel.app`).

## 2. Deploy the Frontend (Next.js)
1. Go to the `frontend` directory.
2. Run `vercel`.
3. Set up the project (name it `tiktok-ai-frontend`).
4. Add the following environment variable:
   - `NEXT_PUBLIC_API_URL` = `[YOUR_BACKEND_URL_FROM_STEP_1]`
5. Vercel will auto-detect Next.js and build it.

## 3. (Optional) Single Domain
If you want both on one domain, you can move the backend files into an `api` folder in the frontend, but the current split structure is cleaner for scaling.

---
**Note:** Ensure you have the [Vercel CLI](https://vercel.com/download) installed: `npm i -g vercel`.
