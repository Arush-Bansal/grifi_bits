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

  const headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "max-age=0",
    "Sec-Ch-Ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "Referer": "https://www.google.com/",
  };

  try {
    const { data } = await axios.get(url, {
      headers,
      timeout: 15000,
      maxRedirects: 5,
    });
    const $ = cheerio.load(data);

    // Detect CAPTCHA / bot block page
    const pageTitle = $("title").text().trim().toLowerCase();
    if (pageTitle.includes("robot") || pageTitle.includes("captcha") || pageTitle.includes("sorry")) {
      console.warn("[LinkProcessor] Amazon returned a CAPTCHA/bot-detection page.");
      throw new Error("Amazon blocked the request (CAPTCHA). Please try again in a moment.");
    }

    const title = $("#productTitle").text().trim()
      || $('meta[property="og:title"]').attr("content")?.trim()
      || $("title").text().trim()
      || "Unknown Product";
    const description = $("#feature-bullets").text().trim()
      || $('meta[name="description"]').attr("content")?.trim()
      || "";

    // Collect image URLs from multiple sources
    const imageUrls: string[] = [];
    const seen = new Set<string>();

    const addImage = (src: string | undefined) => {
      if (!src || seen.has(src)) return;
      if (src.startsWith("data:") || src.includes("sprite") || src.includes("grey-pixel") || src.includes("transparent-pixel")) return;
      seen.add(src);
      imageUrls.push(src);
    };

    // Helper: upgrade Amazon thumbnail to high-res by replacing size tokens
    const upgradeToHiRes = (src: string): string => {
      return src.replace(/\._[A-Z]{2}\d+_[A-Z]{2}\d+_/g, "._SX679_")
        .replace(/\._[A-Z]{2}\d+_/g, "._SX679_");
    };

    // 1. Main landing image (highest priority)
    const landingImg = $("#landingImage").attr("data-old-hires") || $("#landingImage").attr("src");
    addImage(landingImg);

    // 2. Try to extract hi-res URLs from the embedded JSON data (colorImages / imageGalleryData)
    $("script").each((_, el) => {
      const scriptText = $(el).html() || "";
      const hiResMatch = scriptText.match(/"hiRes"\s*:\s*"(https:\/\/[^"]+)"/g);
      if (hiResMatch) {
        for (const match of hiResMatch) {
          const urlMatch = match.match(/"hiRes"\s*:\s*"(https:\/\/[^"]+)"/);
          if (urlMatch?.[1]) addImage(urlMatch[1]);
        }
      }
      const largeMatch = scriptText.match(/"large"\s*:\s*"(https:\/\/[^"]+)"/g);
      if (largeMatch) {
        for (const match of largeMatch) {
          const urlMatch = match.match(/"large"\s*:\s*"(https:\/\/[^"]+)"/);
          if (urlMatch?.[1]) addImage(urlMatch[1]);
        }
      }
    });

    // 3. Alt image thumbnails — upgrade to hi-res
    $("#altImages img, .imageThumbnail img, #imageBlock img").each((_, el) => {
      const src = $(el).attr("src");
      if (src && src.startsWith("http")) {
        addImage(upgradeToHiRes(src));
      }
    });

    // 4. Main image from og:image meta tag as fallback
    const ogImage = $('meta[property="og:image"]').attr("content");
    addImage(ogImage);

    console.log(`[LinkProcessor] Title: "${title}", Found ${imageUrls.length} Amazon images`);

    return {
      title,
      imageUrls: imageUrls.slice(0, 5),
      description,
    };
  } catch (error) {
    console.error("Error fetching Amazon URL:", error);
    const msg = (error as Error).message || "Failed to fetch Amazon product info.";
    throw new Error(msg);
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
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  };

  try {
    const { data } = await axios.get(url, { headers, timeout: 15000 });
    const $ = cheerio.load(data);

    const title = $("title").text().trim() || "Unknown Page";
    const description = $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content");

    // Collect images from multiple sources
    const imageUrls: string[] = [];
    const seen = new Set<string>();

    const resolveUrl = (src: string): string => {
      try {
        return new URL(src, url).href;
      } catch {
        return src;
      }
    };

    const addImage = (src: string | undefined) => {
      if (!src) return;
      const resolved = resolveUrl(src);
      if (seen.has(resolved)) return;
      if (resolved.startsWith("data:") || resolved.includes("spacer") || resolved.includes("pixel") || resolved.includes(".svg")) return;
      seen.add(resolved);
      imageUrls.push(resolved);
    };

    // 1. Open Graph and Twitter meta images (highest quality)
    addImage($('meta[property="og:image"]').attr("content"));
    addImage($('meta[property="og:image:secure_url"]').attr("content"));
    addImage($('meta[name="twitter:image"]').attr("content"));
    addImage($('meta[name="twitter:image:src"]').attr("content"));

    // 2. Additional og:image tags (some pages have multiple)
    $('meta[property="og:image"]').each((_, el) => {
      addImage($(el).attr("content"));
    });

    // 3. Prominent page images — filter out small icons/logos/trackers
    $("img").each((_, el) => {
      if (imageUrls.length >= 5) return;

      const src = $(el).attr("src") || $(el).attr("data-src") || $(el).attr("data-lazy-src");
      if (!src || src.startsWith("data:")) return;

      // Skip images that are explicitly tiny (icons, trackers)
      const width = parseInt($(el).attr("width") || "0", 10);
      const height = parseInt($(el).attr("height") || "0", 10);
      if ((width > 0 && width < 100) || (height > 0 && height < 100)) return;

      // Skip common non-product images by class/id patterns
      const classAndId = `${$(el).attr("class") || ""} ${$(el).attr("id") || ""}`.toLowerCase();
      if (classAndId.match(/logo|icon|avatar|badge|sprite|banner-ad|tracking/)) return;

      addImage(src);
    });

    console.log(`[LinkProcessor] Found ${imageUrls.length} images for generic link: ${title}`);

    return {
      title,
      imageUrls: imageUrls.slice(0, 5),
      description,
    };
  } catch (error) {
    console.error("Error fetching generic URL:", error);
    return { title: url, imageUrls: [] };
  }
}
