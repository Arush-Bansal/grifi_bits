import { NextRequest, NextResponse } from "next/server";
import { processAmazonLink, processInstagramReel, processGenericLink } from "@/lib/link-processor";
import path from "path";
import os from "os";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const tempDir = path.join(os.tmpdir(), "orbit-links", Date.now().toString());
    fs.mkdirSync(tempDir, { recursive: true });

    let result;
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

    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Link fetching error:", err);
    return NextResponse.json({ error: err.message || "Failed to process link" }, { status: 500 });
  }
}
