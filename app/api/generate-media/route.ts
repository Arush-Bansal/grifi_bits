import { NextRequest, NextResponse } from "next/server";
import { generateImage, generateAudio, getAudioDuration } from "@/lib/media-gen";
import { currentVideoGenerator } from "@/lib/video-gen";
import path from "path";
import os from "os";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const { scenes, references, voice_id } = await req.json();

    if (!scenes || !references) {
      return NextResponse.json({ error: "Scenes and references are required" }, { status: 400 });
    }

    const tempDir = path.join(os.tmpdir(), "orbit-gen", Date.now().toString());
    fs.mkdirSync(tempDir, { recursive: true });

    // 1. Generate References (Images)
    console.log("[GenerateAPI] Generating Ref Images...");
    const referenceAssets: Record<string, string> = {};
    for (const [key, prompt] of Object.entries(references)) {
      referenceAssets[key] = await generateImage(prompt as string);
    }

    // 2. Generate Scenes (Image -> Audio -> Video)
    console.log("[GenerateAPI] Generating Scenes...");
    const sceneResults = [];
    for (const scene of scenes) {
      // Step A: Image
      const imageUrl = await generateImage(scene.image_prompt, scene.main_reference, scene.secondary_reference);
      
      // Step B: Audio
      const audioPath = await generateAudio(scene.speech, voice_id || process.env.ELEVEN_LABS_VOICE_ID, tempDir);
      const audioDuration = await getAudioDuration(audioPath);
      // In a real app, upload audioPath to storage and get URL
      
      // Step C: Video (Image to Video)
      const videoUrl = await currentVideoGenerator.generate({
        imageUrl,
        prompt: scene.video_prompt || "Cinematic movement",
        duration: 5,
        aspectRatio: "9:16"
      });

      sceneResults.push({
        id: scene.id,
        image_url: imageUrl,
        audio_url: `/api/audio?path=${encodeURIComponent(audioPath)}`,
        audio_duration: audioDuration,
        video_url: videoUrl
      });
    }

    return NextResponse.json({ referenceAssets, sceneResults });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Media generation error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate media" }, { status: 500 });
  }
}
