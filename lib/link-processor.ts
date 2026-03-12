import axios from "axios";
import * as cheerio from "cheerio";
import { create } from "yt-dlp-exec";
import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export interface ScrapedProduct {
  title: string;
  imageUrls: string[];
  description?: string;
  colors?: string[];
  rawText?: string;
  price?: string;
}

export async function processBlinkitLink(url: string, pinCode: string = "110001"): Promise<ScrapedProduct> {
  console.log(`\n[LinkProcessor] Fetching Blinkit product info: ${url} (PIN: ${pinCode})`);

  const headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Cookie": `lat=28.6139; lon=77.2090; pin_code=${pinCode}; address_id=0;`, // Mimic location
  };

  try {
    const { data } = await axios.get(url, { headers, timeout: 15000 });
    const $ = cheerio.load(data);

    const title = $(".pdp-title").text().trim() || $("h1").text().trim() || "Unknown Blinkit Product";
    const description = $(".pdp-description-content").text().trim() || "";
    const price = $(".pdp-price").text().trim() || "";

    const imageUrls: string[] = [];
    $(".pdp-image-container img").each((_, el) => {
      const src = $(el).attr("src");
      if (src && src.startsWith("http")) imageUrls.push(src);
    });

    if (imageUrls.length === 0) {
      // Fallback to og:image
      const ogImage = $('meta[property="og:image"]').attr("content");
      if (ogImage) imageUrls.push(ogImage);
    }

    return {
      title,
      imageUrls: imageUrls.slice(0, 5),
      description,
      price,
      rawText: `Price: ${price}\n${description}`,
    };
  } catch (error) {
    console.error("Error fetching Blinkit URL:", error);
    throw new Error("Failed to fetch Blinkit product info. Check the URL or PIN code.");
  }
}

export async function processZeptoLink(url: string, pinCode: string = "110001"): Promise<ScrapedProduct> {
  console.log(`\n[LinkProcessor] Fetching Zepto product info: ${url} (PIN: ${pinCode})`);
  // Zepto is heavily client-side, but let's try basic scraping
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  };

  try {
    const { data } = await axios.get(url, { headers, timeout: 15000 });
    const $ = cheerio.load(data);

    const title = $('meta[property="og:title"]').attr("content") || $("h1").text().trim() || "Unknown Zepto Product";
    const description = $('meta[property="og:description"]').attr("content") || "";
    
    const imageUrls: string[] = [];
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage) imageUrls.push(ogImage);

    return {
      title,
      imageUrls,
      description,
    };
  } catch (error) {
    console.error("Error fetching Zepto URL:", error);
    throw new Error("Failed to fetch Zepto product info.");
  }
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

export async function processInstagramReel(url: string, outputDir: string): Promise<ScrapedProduct> {
  // Check if we should use the enhanced version
  return processInstagramReelEnhanced(url, outputDir);
}

async function extractAudio(videoPath: string, outputDir: string): Promise<string> {
  const audioPath = path.join(outputDir, "audio.mp3");
  console.log(`[LinkProcessor] Extracting audio to ${audioPath}`);
  
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .toFormat("mp3")
      .on("end", () => resolve(audioPath))
      .on("error", (err) => reject(err))
      .save(audioPath);
  });
}

async function extractKeyframes(videoPath: string, outputDir: string, count: number = 15): Promise<string[]> {
  console.log(`[LinkProcessor] Extracting ${count} keyframes...`);
  
  return new Promise((resolve, reject) => {
    const frames: string[] = [];
    ffmpeg(videoPath)
      .on("filenames", (filenames) => {
        filenames.forEach(f => frames.push(path.join(outputDir, f)));
      })
      .on("end", () => resolve(frames))
      .on("error", (err) => reject(err))
      .screenshots({
        count,
        folder: outputDir,
        filename: "frame-%i.jpg"
      });
  });
}

async function transcribeAudio(audioPath: string): Promise<string> {
  console.log(`[LinkProcessor] Transcribing audio...`);
  try {
    const audioBuffer = await fs.promises.readFile(audioPath);
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Transcribe the following audio precisely. If no speech is detected, return 'No speech detected'." },
            { 
              type: "file", 
              data: new Uint8Array(audioBuffer), 
              mimeType: "audio/mpeg" 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any
          ]
        }
      ]
    });
    return text.trim();
  } catch (error: unknown) {
    const err = error as { name?: string; code?: string; message?: string };
    if (err.name === 'ZodError' || err.code === 'AI_TypeValidationError') {
      console.warn("[LinkProcessor] Transcription Schema Error, check multimodal part structure.");
    } else {
      console.warn("[LinkProcessor] Transcription failed:", err.message || error);
    }
    return "No speech detected or transcription failed.";
  }
}

async function synthesizeInstagramReel(url: string, transcription: string, frames: string[]): Promise<ScrapedProduct> {
  console.log(`[LinkProcessor] Synthesizing Instagram Reel info...`);
  
  try {
    const frameData = await Promise.all(frames.map(async (f) => {
      const buffer = await fs.promises.readFile(f);
      return buffer;
    }));

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `You are analyzing an Instagram Reel: ${url}.
Transcription: ${transcription}

Analyze these ${frames.length} frames and return a JSON object with:
- "product_name": A short, catchy name for the product or brand in the video.
- "product_description": A 3-5 sentence description of EXACTLY what happens in the video (e.g., "A user unboxing the item, showing the texture, and applying it..."). Focus on actions.
- "chosen_image_indices": Select EXACTLY 4 indices from [0 to ${frames.length - 1}] that represent the best/clearest shots of the product or key moments.
- "reasoning": Brief reasoning for your choice.

Return ONLY valid JSON.` 
            },
            ...frameData.map(buffer => ({
              type: "image" as const,
              image: new Uint8Array(buffer),
              mimeType: "image/jpeg"
            }))
          ]
        }
      ],
    });

    // Handle potential markdown wrapping
    let jsonContent = text.trim();
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.replace(/^```json\n/, "").replace(/\n```$/, "");
    }

    const synthesis = JSON.parse(jsonContent) as {
      product_name: string;
      product_description: string;
      chosen_image_indices: number[];
      reasoning: string;
    };

    const chosenFrames = synthesis.chosen_image_indices.map(idx => frames[idx] || frames[0]);
    // Read the chosen frames as base64 for the return
    const images = await Promise.all(chosenFrames.map(async (f) => {
      const buf = await fs.promises.readFile(f);
      return `data:image/jpeg;base64,${buf.toString("base64")}`;
    }));

    return {
      title: synthesis.product_name,
      description: synthesis.product_description,
      imageUrls: images,
      rawText: `Transcription: ${transcription}\nReasoning: ${synthesis.reasoning}`
    };
  } catch (error) {
    console.error("[LinkProcessor] Synthesis failed:", error);
    // Fallback to basic extraction
    const base64Frames = await Promise.all(frames.slice(0, 4).map(async (f) => {
      const buffer = await fs.promises.readFile(f);
      return `data:image/jpeg;base64,${buffer.toString("base64")}`;
    }));
    return {
      title: "Instagram Reel",
      imageUrls: base64Frames,
      description: transcription
    };
  }
}

export async function processInstagramReelEnhanced(url: string, outputDir: string): Promise<ScrapedProduct> {
  console.log(`\n[LinkProcessor] Enhanced Processing of Instagram Reel: ${url}`);

  const tempVideo = path.join(outputDir, "temp_reel.mp4");

  try {
    // 1. Download Video
    const projectRoot = process.cwd();
    const binaryPath = path.join(projectRoot, "node_modules", "yt-dlp-exec", "bin", "yt-dlp.exe");
    
    // Simple download logic (reuse existing binary finding logic if possible, but let's be direct for now)
    const { exec } = await import("yt-dlp-exec");
    const ytdlp = fs.existsSync(binaryPath) ? create(binaryPath) : exec;
    
    await ytdlp(url, {
      output: tempVideo,
      noPlaylist: true,
      format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
    });

    // 2. Extract Media
    const [audioPath, framePaths] = await Promise.all([
      extractAudio(tempVideo, outputDir),
      extractKeyframes(tempVideo, outputDir, 15)
    ]);

    // 3. AI Pipeline
    const transcription = await transcribeAudio(audioPath);
    const result = await synthesizeInstagramReel(url, transcription, framePaths);

    return result;
  } catch (error) {
    console.error("Error in enhanced Instagram Reel processing:", error);
    throw error;
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

    // 1. Extract Name
    const title = $('meta[property="og:site_name"]').attr("content")
      || $("title").text().split("|")[0].split("-")[0].trim()
      || "Unknown Page";

    // 2. Extract Description / USP
    const description = $('meta[name="description"]').attr("content")
      || $('meta[property="og:description"]').attr("content")
      || $('meta[name="twitter:description"]').attr("content")
      || "";

    // 3. Extract Colors
    const colors: string[] = [];
    const themeColor = $('meta[name="theme-color"]').attr("content");
    if (themeColor && /^#[0-9a-fA-F]{3,6}$/.test(themeColor)) {
      colors.push(themeColor);
    }

    const hexRegex = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
    const styles = $("style")
      .map((_, el) => $(el).text())
      .get()
      .join(" ");
    const styleMatches = styles.match(hexRegex);
    if (styleMatches) {
      const uniqueColors = [...new Set(styleMatches)].slice(0, 5);
      colors.push(...uniqueColors.filter(c => !colors.includes(c)));
    }

    // 4. Clean Raw Text (Remove boilerplate)
    const $clone = $.load(data);
    $clone("script, style, noscript, header, footer, nav").remove();
    const rawText = $clone("body").text().replace(/\s+/g, " ").trim().slice(0, 2000);

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
      
      // Filter out common tracking pixels and garbage
      if (resolved.startsWith("data:") || 
          resolved.includes("spacer") || 
          resolved.includes("pixel") || 
          resolved.includes("cleardot") ||
          resolved.includes("s.gif") ||
          resolved.includes("transparent") ||
          resolved.match(/tracking|analytics/i) ||
          resolved.includes(".svg")) return;

      // Only allow common image formats
      if (!resolved.match(/\.(jpg|jpeg|png|webp)(\?|#|$)/i) && !resolved.startsWith("http")) return;

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

    // 3. Prominent page images
    $("img").each((_, el) => {
      if (imageUrls.length >= 8) return;

      let src = $(el).attr("src") 
                || $(el).attr("data-src") 
                || $(el).attr("data-lazy-src") 
                || $(el).attr("data-original")
                || $(el).attr("data-high-res")
                || $(el).attr("data-zoom-image");

      const srcset = $(el).attr("srcset") || $(el).attr("data-srcset");
      if (srcset) {
        // Parse srcset and pick the largest one (e.g. "url1 100w, url2 500w")
        const parts = srcset.split(",").map(p => p.trim());
        const bestPart = parts[parts.length - 1]; // Usually the last one is largest
        const urlPart = bestPart.split(/\s+/)[0];
        if (urlPart) src = urlPart;
      }

      if (!src || src.startsWith("data:")) return;

      const width = parseInt($(el).attr("width") || "0", 10);
      const height = parseInt($(el).attr("height") || "0", 10);
      if ((width > 0 && width < 50) || (height > 0 && height < 50)) return;

      const classAndId = `${$(el).attr("class") || ""} ${$(el).attr("id") || ""}`.toLowerCase();
      // Only filter out truly decorative or tiny meta-images
      if (classAndId.match(/badge|sprite|tracking|invisible|hidden|sr-only/)) return;

      addImage(src);
    });

    console.log(`[LinkProcessor] Found ${imageUrls.length} images for generic link: ${title}`);

    return {
      title,
      imageUrls: imageUrls.slice(0, 8),
      description,
      colors: colors.slice(0, 5),
      rawText,
    };
  } catch (error) {
    console.error("Error fetching generic URL:", error);
    return { title: url, imageUrls: [] };
  }
}
