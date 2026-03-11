import path from "path";
import fs from "fs";
import { uploadVideo } from "@/lib/supabase/storage";

// Simple mutual exclusion lock for rendering to prevent resource exhaustion on Vercel
let isRendering = false;
const queue: (() => void)[] = [];

async function acquireLock() {
  if (!isRendering) {
    isRendering = true;
    return;
  }
  return new Promise<void>((resolve) => {
    queue.push(resolve);
  });
}

function releaseLock() {
  const next = queue.shift();
  if (next) {
    next();
  } else {
    isRendering = false;
  }
}

export async function renderLogoVideo(logoUrl: string): Promise<string> {
  await acquireLock();
  
  try {
    // Dynamically import Remotion server-side packages to avoid webpack issues during Next.js build
    const { bundle } = await import("@remotion/bundler");
    const { renderMedia, selectComposition } = await import("@remotion/renderer");

    const compositionId = "LogoTemplate";
    const entry = path.resolve("remotion/Root.tsx");
    
    console.log("[Remotion] Bundling...");
    const bundleLocation = await bundle(entry);

    const inputProps = {
      logoUrl,
    };

    console.log("[Remotion] Selecting composition...");
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps,
    });

    const outputDir = path.resolve("tmp/renders");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputLocation = path.join(outputDir, `logo-${Date.now()}.mp4`);

    const renderWithRetry = async (attempt = 1): Promise<void> => {
      try {
        console.log(`[Remotion] Rendering (Attempt ${attempt})...`);
        await renderMedia({
          composition,
          serveUrl: bundleLocation,
          codec: "h264",
          outputLocation,
          inputProps,
          logLevel: "info", // Reduced from 'verbose' to avoid noise
        });
      } catch (err) {
        if (attempt < 2) {
          console.warn(`[Remotion] Render failed (Attempt ${attempt}), retrying...`, err);
          return renderWithRetry(attempt + 1);
        }
        throw err;
      }
    };

    await renderWithRetry();

    console.log(`[Remotion] Rendered locally to ${outputLocation}`);

    console.log("[Remotion] Uploading to Supabase...");
    const publicUrl = await uploadVideo(outputLocation);

    if (!publicUrl) {
      throw new Error("Failed to upload video to Supabase Storage");
    }

    // Cleanup local file
    try {
      if (fs.existsSync(outputLocation)) {
        fs.unlinkSync(outputLocation);
        console.log(`[Remotion] Cleaned up local file: ${outputLocation}`);
      }
    } catch (err) {
      console.warn(`[Remotion] Failed to cleanup local file: ${outputLocation}`, err);
    }

    console.log(`[Remotion] Uploaded to Supabase: ${publicUrl}`);
    return publicUrl;
  } finally {
    releaseLock();
  }
}
