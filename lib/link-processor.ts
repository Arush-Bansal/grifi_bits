import axios from "axios";
import * as cheerio from "cheerio";
import { create } from "yt-dlp-exec";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import child_process from "child_process";

const execAsync = promisify(child_process.exec);

export interface ScrapedProduct {
  title: string;
  imageUrls: string[];
  description?: string;
}

export async function processAmazonLink(url: string): Promise<ScrapedProduct> {
  console.log(`\n[LinkProcessor] Fetching Amazon product info: ${url}`);
  
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  };

  try {
    const { data } = await axios.get(url, { headers, timeout: 10000 });
    const $ = cheerio.load(data);

    const title = $("#productTitle").text().trim() || "Unknown Product";
    const imageUrl = $("#landingImage").attr("src");
    const description = $("#feature-bullets").text().trim();

    return {
      title,
      imageUrls: imageUrl ? [imageUrl] : [],
      description,
    };
  } catch (error) {
    console.error("Error fetching Amazon URL:", error);
    throw new Error("Failed to fetch Amazon product info.");
  }
}

export async function processInstagramReel(url: string, outputDir: string): Promise<string[]> {
  console.log(`\n[LinkProcessor] Processing Instagram Reel: ${url}`);
  
  const tempVideo = path.join(outputDir, "temp_reel.mp4");
  
  try {
    // 1. Find project root and binary
    const cwd = process.cwd();
    console.log(`[LinkProcessor] Current working directory: ${cwd}`);
    
    // In Next.js dev, cwd is project root. In built server, it might be project_root/.next/server
    let projectRoot = cwd;
    if (cwd.endsWith(path.join(".next", "server"))) {
       projectRoot = path.join(cwd, "..", "..");
    } else if (cwd.endsWith(".next\\server")) { // Handling windows specifically
       projectRoot = path.join(cwd, "..", "..");
    }
    
    const binaryPath = path.join(projectRoot, "node_modules", "yt-dlp-exec", "bin", "yt-dlp.exe");
    console.log(`[LinkProcessor] Predicted binary path: ${binaryPath}`);
    
    if (fs.existsSync(binaryPath)) {
      console.log(`[LinkProcessor] Found binary at explicit path.`);
      const ytdlp = create(binaryPath);
      await ytdlp(url, {
        output: tempVideo,
        noPlaylist: true,
        format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
      });
    } else {
      console.warn(`[LinkProcessor] Binary NOT found at ${binaryPath}. Falling back to default exec.`);
      // Check if it's in a different node_modules location
      const fallbackPath = path.resolve(__dirname, "..", "node_modules", "yt-dlp-exec", "bin", "yt-dlp.exe");
       console.log(`[LinkProcessor] Checking fallback path: ${fallbackPath}`);
       
       if (fs.existsSync(fallbackPath)) {
          const ytdlp = create(fallbackPath);
          await ytdlp(url, {
            output: tempVideo,
            noPlaylist: true,
            format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
          });
       } else {
          // Absolute last resort: use the library's default logic but hope it works
          const { exec } = await import("yt-dlp-exec");
          await exec(url, {
            output: tempVideo,
            noPlaylist: true,
            format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
          });
       }
    }

    console.log("[LinkProcessor] Extracting keyframes...");
    
    // 2. Extract frames using ffmpeg
    const framesPattern = path.join(outputDir, "reel_frame_%02d.jpg");
    await execAsync(`ffmpeg -y -i "${tempVideo}" -vf "fps=1/2" -vframes 5 "${framesPattern}"`);

    // 3. Collect frame paths
    const frames: string[] = [];
    for (let i = 1; i <= 5; i++) {
      const framePath = path.join(outputDir, `reel_frame_${String(i).padStart(2, '0')}.jpg`);
      if (fs.existsSync(framePath)) {
        frames.push(framePath);
      }
    }

    return frames;
  } catch (error) {
    console.error("Error processing Instagram Reel:", error);
    return [];
  }
}

export async function processGenericLink(url: string): Promise<ScrapedProduct> {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  };

  try {
    const { data } = await axios.get(url, { headers, timeout: 10000 });
    const $ = cheerio.load(data);

    const title = $("title").text().trim() || "Unknown Page";
    const ogImage = $('meta[property="og:image"]').attr("content");
    const description = $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content");

    return {
      title,
      imageUrls: ogImage ? [ogImage] : [],
      description,
    };
  } catch (error) {
    console.error("Error fetching generic URL:", error);
    return { title: url, imageUrls: [] };
  }
}
