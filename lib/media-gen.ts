import * as fal from "@fal-ai/serverless-client";
import { ElevenLabsClient } from "elevenlabs";
import fs from "fs";
import path from "path";

// Configure Fal.ai
// In Next.js, we should use environment variables
// FAL_KEY should be set in .env

export async function generateImage(prompt: string): Promise<string> {
  console.log(`[MediaGen] Generating image with Fal.ai: ${prompt.slice(0, 50)}...`);
  const result = await fal.run("fal-ai/flux/schnell", {
    input: {
      prompt,
      image_size: "portrait_9_16",
    },
  }) as { images: Array<{ url: string }> };
  return result.images[0].url;
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
  } catch (error: any) {
    console.error("[MediaGen] Kling Video Error details:", error.data || error);
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

  // Since el.generate returns a Readable stream or Buffer depending on usage
  const fileStream = fs.createWriteStream(filePath);
  // @ts-expect-error - handling stream piping
  (audio as any).pipe(fileStream);

  return new Promise((resolve, reject) => {
    fileStream.on("finish", () => resolve(filePath));
    fileStream.on("error", reject);
  });
}
