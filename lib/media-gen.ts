import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { ElevenLabsClient } from "elevenlabs";
import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { uploadImageFromBase64 } from "./supabase/storage";

const execFileAsync = promisify(execFile);

const googleAi = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

async function downloadImageAsBase64Parts(imageUrl: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 15000,
    });
    const contentType = response.headers["content-type"] || "image/jpeg";
    const base64 = Buffer.from(response.data).toString("base64");
    return { data: base64, mimeType: contentType };
  } catch (error) {
    console.error(`[MediaGen] Failed to download image: ${imageUrl}`, error);
    return null;
  }
}

export async function generateImage(prompt: string, mainRef?: string, secondaryRef?: string, aspectRatio: "9:16" | "1:1" | "16:9" = "9:16"): Promise<string> {
  console.log(`[MediaGen] Generating image with Gemini 2.5 Flash Image: ${prompt.slice(0, 50)}...`);
  console.log(`[MediaGen] References - Main: ${!!mainRef}, Secondary: ${!!secondaryRef}`);
  
  try {
    // Download references if they exist
    const [mainRefParts, secondaryRefParts] = await Promise.all([
      mainRef ? downloadImageAsBase64Parts(mainRef) : Promise.resolve(null),
      secondaryRef ? downloadImageAsBase64Parts(secondaryRef) : Promise.resolve(null),
    ]);

    const contents: Array<string | object> = [prompt];
    if (mainRefParts) {
      contents.push({
        inlineData: {
          data: mainRefParts.data,
          mimeType: mainRefParts.mimeType
        }
      });
    }
    if (secondaryRefParts) {
      contents.push({
        inlineData: {
          data: secondaryRefParts.data,
          mimeType: secondaryRefParts.mimeType
        }
      });
    }

    const response = await googleAi.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents,
      config: {
        // @ts-expect-error GenAI SDK typings might not be fully up-to-date
        responseModalities: ["IMAGE"],
        imageConfig: {
          aspectRatio, // Note: Python SDK uses aspect_ratio, JS SDK or underlying REST usually uses camelCase aspectRatio
        }
      }
    });

    const generatedImageBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const generatedImageMime = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'image/png';

    if (!generatedImageBase64) {
      throw new Error("No image data returned from Gemini 2.5 Flash Image");
    }

    const publicUrl = await uploadImageFromBase64(`data:${generatedImageMime};base64,${generatedImageBase64}`);
    console.log("[MediaGen] Public URL after upload:", publicUrl);

    if (!publicUrl) throw new Error("Failed to upload generated image to Supabase");
    return publicUrl;
  } catch (error) {
    console.error("[MediaGen] Image Gen Error:", error);
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
