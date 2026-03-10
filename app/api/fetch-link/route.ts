import { NextRequest, NextResponse } from "next/server";
import { processAmazonLink, processInstagramReel, processGenericLink } from "@/lib/link-processor";
import path from "path";
import os from "os";
import fs from "fs";
import axios from "axios";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { uploadImageFromBase64 } from "@/lib/supabase/storage";

async function downloadImageAsBase64(imageUrl: string): Promise<string | null> {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });

    const contentType = response.headers["content-type"] || "image/jpeg";
    const base64 = Buffer.from(response.data).toString("base64");
    return `data:${contentType};base64,${base64}`;
  } catch (err) {
    console.warn(`[fetch-link] Failed to download image: ${imageUrl}`, (err as Error).message);
    return null;
  }
}

async function cleanupDescription(rawDescription: string, productTitle: string): Promise<string> {
  if (!rawDescription || rawDescription.trim().length < 20) return rawDescription;

  try {
    console.log(`[fetch-link] Cleaning up description with LLM (${rawDescription.length} chars)…`);
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `You are a product copywriter. Clean up the following raw scraped product description. 

Rules:
- Remove all filler text, navigation artifacts, repeated phrases, and irrelevant content
- Keep ONLY the essential product information: what it is, key features, target audience, and unique selling points
- No essential information should be missed
- Do NOT add any information that isn't in the original text
- Do NOT include any headers, bullet points, or markdown formatting
- If the text is mostly garbage/navigation, return just the product name and any useful info you can extract

Product name: ${productTitle}

Raw description:
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
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const tempDir = path.join(os.tmpdir(), "orbit-links", Date.now().toString());
    fs.mkdirSync(tempDir, { recursive: true });

    let result: { title: string; imageUrls: string[]; description?: string; isReel?: boolean };
    if (url.includes("amazon.")) {
      result = await processAmazonLink(url);
    } else if (url.includes("instagram.com/reel")) {
      const frames = await processInstagramReel(url, tempDir);
      const base64Frames = await Promise.all(frames.map(async (f) => {
        const buffer = await fs.promises.readFile(f);
        return `data:image/jpeg;base64,${buffer.toString("base64")}`;
      }));
      result = {
        title: "Instagram Reel",
        imageUrls: base64Frames,
        isReel: true
      };
    } else {
      result = await processGenericLink(url);
    }

    // Run image downloading and description cleanup in parallel
    const imagePromise = (result.imageUrls && result.imageUrls.length > 0)
      ? (async () => {
        const isAlreadyBase64 = result.imageUrls[0]?.startsWith("data:");
        
        console.log(`[fetch-link] Processing ${result.imageUrls.length} images…`);
        
        // 1. Download if needed
        let base64Images: string[] = [];
        if (!isAlreadyBase64) {
          console.log(`[fetch-link] Downloading images as base64…`);
          const base64Results = await Promise.all(
            result.imageUrls.map((imgUrl: string) => downloadImageAsBase64(imgUrl))
          );
          base64Images = base64Results.filter((b64): b64 is string => b64 !== null);
        } else {
          base64Images = result.imageUrls;
        }

        // 2. Upload to Supabase
        console.log(`[fetch-link] Uploading ${base64Images.length} images to Supabase…`);
        const uploadResults = await Promise.all(
          base64Images.map((b64) => uploadImageFromBase64(b64))
        );
        
        result.imageUrls = uploadResults.filter((url): url is string => url !== null);
        console.log(`[fetch-link] Successfully uploaded ${result.imageUrls.length} images to Supabase.`);
      })()
      : Promise.resolve();

    const descriptionPromise = result.description
      ? cleanupDescription(result.description, result.title).then((cleaned) => {
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

