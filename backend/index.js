import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import generateRoute from "./routes/generate.js";
import hashtagsRoute from "./routes/hashtags.js";
import tiktokRoute from "./routes/tiktok.js";
import scrapeRoute from "./routes/scrape.js";
import scrapeUrlRoute from "./routes/scrapeUrl.js";
import trendsRoute from "./routes/trends.js";
import imageGenRoute from "./routes/imageGen.js";

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: "../.env" });
}

const app = express();

app.use(cors());
app.use(express.json());

app.use("/generate", generateRoute);
app.use("/hashtags", hashtagsRoute);
app.use("/tiktok", tiktokRoute);
app.use("/scrape", scrapeRoute);
app.use("/scrape-url", scrapeUrlRoute);
app.use("/trends", trendsRoute);
app.use("/image-gen", imageGenRoute);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
