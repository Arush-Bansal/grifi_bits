import * as fal from "@fal-ai/serverless-client";
import { google } from "@ai-sdk/google";
import { generateImage as aiGenerateImage } from "ai";
import { ElevenLabsClient } from "elevenlabs";
import fs from "fs";
import path from "path";

export async function generateImage(prompt: string): Promise<string> {
  console.log(`[MediaGen] Generating image with Google Imagen: ${prompt.slice(0, 50)}...`);
  const { image } = await aiGenerateImage({
    model: google.image("imagen-4.0-generate-001"),
    prompt,
    aspectRatio: "9:16",
  });

  return `data:image/png;base64,${image.base64}`;
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

  // ElevenLabs SDK v1.x returns an AsyncIterable<Buffer>
  const chunks: Buffer[] = [];
  for await (const chunk of audio as AsyncIterable<Buffer>) {
    chunks.push(Buffer.from(chunk));
  }
  fs.writeFileSync(filePath, Buffer.concat(chunks));

  return filePath;
}
