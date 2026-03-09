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
  console.log(`[MediaGen] Generating image with ${mainRef ? 'Gemini 2.5 Flash (with refs)' : 'Google Imagen'}: ${prompt.slice(0, 50)}...`);
  
  try {
    // If references are provided, the user wants to use Gemini (interpreted from "gemini-2.5-flash-image")
    let base64: string;
    if (mainRef || secondaryRef) {
      const { image } = await aiGenerateImage({
        model: google.image("gemini-2.5-flash-image"),
        prompt: `${prompt}${mainRef ? ` (reference: ${mainRef})` : ""}${secondaryRef ? ` (secondary reference: ${secondaryRef})` : ""}`,
        aspectRatio,
      });
      base64 = image.base64;
    } else {
      const { image } = await aiGenerateImage({
        model: google.image("imagen-4.0-generate-001"),
        prompt,
        aspectRatio,
      });
      base64 = image.base64;
    }

    const publicUrl = await uploadImageFromBase64(base64);
    if (!publicUrl) throw new Error("Failed to upload generated image to Supabase");
    return publicUrl;
  } catch (error) {
    console.error("[MediaGen] Image Gen Error:", error);
    // Fallback to gemini-2.5-flash-image if imagen fails, as requested
    console.log("[MediaGen] Falling back to gemini-2.5-flash-image...");
    const { image } = await aiGenerateImage({
      model: google.image("gemini-2.5-flash-image"),
      prompt,
      aspectRatio,
    });
    const publicUrl = await uploadImageFromBase64(image.base64);
    return publicUrl || `data:image/png;base64,${image.base64}`; // Final fallback to base64 if upload fails
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
  const client = new ElevenLabsClient({ apiKey: process.env.ELEVEN_LABS_KEY });
  const filename = `audio_${Date.now()}.mp3`;
  const filePath = path.join(outputDir, filename);

  console.log(`[MediaGen] Generating audio with ElevenLabs: ${text.slice(0, 50)}...`);

  const audio = await client.generate({
    voice: voiceId,
    text: text,
    model_id: "eleven_multilingual_v2",
  });

  // ElevenLabs SDK v1.x returns an AsyncIterable<Buffer>
  const chunks: Buffer[] = [];
  for await (const chunk of audio as AsyncIterable<Buffer>) {
    chunks.push(Buffer.from(chunk));
  }
  fs.writeFileSync(filePath, Buffer.concat(chunks));

  return filePath;
}

export async function getAudioDuration(filePath: string): Promise<number> {
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      filePath
    ]);
    return parseFloat(stdout.trim());
  } catch (error) {
    console.error("[MediaGen] Error getting audio duration:", error);
    return 3; // Fallback to default
  }
}
