import * as fal from "@fal-ai/serverless-client";
import { google } from "@ai-sdk/google";
import { generateImage as aiGenerateImage } from "ai";
import { ElevenLabsClient } from "elevenlabs";
import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { uploadImageFromBase64 } from "./supabase/storage";

const execFileAsync = promisify(execFile);

export async function generateImage(prompt: string, mainRef?: string, secondaryRef?: string, aspectRatio: "9:16" | "1:1" | "16:9" = "9:16"): Promise<string> {
  console.log(`[MediaGen] Generating image with Gemini 2.5 Flash: ${prompt.slice(0, 50)}...`);
  
  try {
    // Switching to gemini-2.5-flash-image (Nano Banana) by default to avoid Imagen rate limits
    const { image } = await aiGenerateImage({
      model: google.image("gemini-2.5-flash-image"),
      prompt: `${prompt}${mainRef ? ` (reference: ${mainRef})` : ""}${secondaryRef ? ` (secondary reference: ${secondaryRef})` : ""}`,
      aspectRatio,
    });

    console.log("[MediaGen] Image generated from Gemini, length:", image?.base64?.length);

    if (!image.base64) {
      throw new Error("No image data returned from Gemini");
    }

    const publicUrl = await uploadImageFromBase64(image.base64);
    console.log("[MediaGen] Public URL after upload:", publicUrl);

    if (!publicUrl) throw new Error("Failed to upload generated image to Supabase");
    return publicUrl;
  } catch (error) {
    console.error("[MediaGen] Image Gen Error:", error);
    throw error;
  }
}

export async function generateVideo(image_url: string, prompt: string): Promise<string> {
  console.log(`[MediaGen] Generating video with Fal.ai: ${prompt.slice(0, 50)}...`);
  try {
    const result = await fal.run("fal-ai/kling-video/v1.5/pro/image-to-video", {
      input: {
        image_url,
        prompt,
        duration: 5,
        aspect_ratio: "9:16",
      },
    }) as { video: { url: string } };
    return result.video.url;
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? error.message : String(error);
    const dataDetails = (error as { data?: unknown })?.data;
    console.error("[MediaGen] Kling Video Error details:", dataDetails || errorDetails);
    throw error;
  }
}

export async function generateAudio(text: string, voiceId: string, outputDir: string): Promise<string> {
  console.log(`[MediaGen] Initializing ElevenLabs with Key starting with: ${process.env.ELEVEN_LABS_KEY?.slice(0, 4)}`);
  const client = new ElevenLabsClient({ apiKey: process.env.ELEVEN_LABS_KEY });
  const filename = `audio_${Date.now()}.mp3`;
  const filePath = path.join(outputDir, filename);

  console.log(`[MediaGen] Generating audio with ElevenLabs: ${text.slice(0, 50)}...`);

  try {
    const audio = await client.generate({
      voice: voiceId,
      text: text,
      model_id: "eleven_multilingual_v2",
    });

    console.log("[MediaGen] Received audio stream from ElevenLabs");

    const chunks: Buffer[] = [];
    for await (const chunk of audio as AsyncIterable<Buffer>) {
      chunks.push(Buffer.from(chunk));
    }
    const fullBuffer = Buffer.concat(chunks);
    console.log(`[MediaGen] Audio buffer complete, size: ${fullBuffer.length} bytes`);
    
    fs.writeFileSync(filePath, fullBuffer);
    console.log(`[MediaGen] Audio file written to: ${filePath}`);

    return filePath;
  } catch (error) {
    console.error("[MediaGen] ElevenLabs Error:", error);
    throw error;
  }
}

export async function getAudioDuration(filePath: string): Promise<number> {
  console.log(`[MediaGen] probing duration for: ${filePath}`);
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      filePath
    ], { timeout: 10000 }); // 10s timeout to prevent hangs
    
    const duration = parseFloat(stdout.trim());
    console.log(`[MediaGen] ffprobe result: ${duration}s`);
    return duration;
  } catch (error) {
    console.error("[MediaGen] Error getting audio duration:", error);
    return 3; // Fallback to default
  }
}
