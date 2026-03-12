import { NextRequest, NextResponse } from "next/server";
import { processAmazonLink, processInstagramReel, processGenericLink, processBlinkitLink, processZeptoLink, ScrapedProduct } from "@/lib/link-processor";
import path from "path";
import os from "os";
import fs from "fs";
import axios from "axios";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { uploadImageFromBase64 } from "@/lib/supabase/storage";

async function downloadImageAsBase64(imageUrl: string, requestId: string): Promise<{ base64: string, contentType: string } | null> {
  try {
    const urlObj = new URL(imageUrl);
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Sec-Ch-Ua": '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "image",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
        "Referer": urlObj.origin,
      },
    });

    const contentType = (response.headers["content-type"] || "image/jpeg").split(';')[0].split(' ')[0].trim().toLowerCase();
    
    // Validate it's an actual image
    if (!contentType.startsWith('image/')) {
      console.warn(`[fetch-link][${requestId}] URL returned non-image content (${contentType}): ${imageUrl}`);
      return null;
    }

    const base64 = Buffer.from(response.data).toString("base64");
    return {
      base64: `data:${contentType};base64,${base64}`,
      contentType
    };
  } catch (err) {
    console.warn(`[fetch-link][${requestId}] Failed to download image: ${imageUrl}`, (err as Error).message);
    return null;
  }
}

async function cleanupDescription(rawDescription: string, productTitle: string): Promise<string> {
  if (!rawDescription || rawDescription.trim().length < 20) return rawDescription;

  try {
    console.log(`[fetch-link] Cleaning up description with LLM (${rawDescription.length} chars)…`);
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `You are a brand strategist. Clean up and synthesize the following raw scraped website data into a concise Brand Profile. 

Rules:
- Identify the brand tone (e.g., Professional, Playful, Premium)
- Extract the core USP (Unique Selling Proposition) and target audience
- Remove all filler text, navigation artifacts, and irrelevant boilerplate
- Keep the output concise and formatted as a single descriptive paragraph
- Do NOT add any information that isn't in the original text
- If the text is mostly garbage, return just the product name and any useful info you can extract

Product name: ${productTitle}

Scraped Content:
${rawDescription.slice(0, 3000)}`,
    });

    console.log(`[fetch-link] Description cleaned: ${text.length} chars`);
    return text.trim();
  } catch (err) {
    console.warn(`[fetch-link] LLM cleanup failed, using raw description:`, (err as Error).message);
    return rawDescription;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url, pinCode } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const tempDir = path.join(os.tmpdir(), "orbit-links", Date.now().toString());
    fs.mkdirSync(tempDir, { recursive: true });

    const requestId = Date.now().toString().slice(-6);
    let result: ScrapedProduct;
    
    if (url.includes("amazon.")) {
      result = await processAmazonLink(url);
    } else if (url.includes("blinkit.com")) {
      result = await processBlinkitLink(url, pinCode);
    } else if (url.includes("zepto")) {
      result = await processZeptoLink(url, pinCode);
    } else if (url.includes("instagram.com/reel")) {
      result = await processInstagramReel(url, tempDir);
    } else {
      result = await processGenericLink(url);
    }

    // Run image downloading and description cleanup in parallel
    const imagePromise = (result.imageUrls && result.imageUrls.length > 0)
      ? (async () => {
        const isAlreadyBase64 = result.imageUrls[0]?.startsWith("data:");
        
        console.log(`[fetch-link][${requestId}] Processing ${result.imageUrls.length} images…`);
        
        // 1. Download if needed
        let imageItems: Array<{ base64: string, contentType?: string }> = [];
        if (!isAlreadyBase64) {
          console.log(`[fetch-link][${requestId}] Downloading images as base64…`);
          const downloadResults = await Promise.all(
            result.imageUrls.map((imgUrl: string) => downloadImageAsBase64(imgUrl, requestId))
          );
          imageItems = downloadResults.filter((item): item is { base64: string, contentType: string } => item !== null);
        } else {
          imageItems = result.imageUrls.map(b64 => ({ base64: b64 }));
        }

        // 2. Upload to Supabase
        console.log(`[fetch-link][${requestId}] Uploading ${imageItems.length} images to Supabase…`);
        const uploadResults = await Promise.all(
          imageItems.map((item) => uploadImageFromBase64(item.base64, "orbit-assets", item.contentType))
        );
        
        result.imageUrls = uploadResults.filter((url): url is string => url !== null);
        console.log(`[fetch-link][${requestId}] Successfully uploaded ${result.imageUrls.length} images to Supabase.`);
      })()
      : Promise.resolve();

    const descriptionPromise = (result.description || result.rawText)
      ? cleanupDescription(result.description || result.rawText || "", result.title).then((cleaned) => {
        result.description = cleaned;
      })
      : Promise.resolve();

    await Promise.all([imagePromise, descriptionPromise]);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Link fetching error:", err);
    return NextResponse.json({ error: err.message || "Failed to process link" }, { status: 500 });
  }
}

