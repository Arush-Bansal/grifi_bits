import { NextRequest, NextResponse } from "next/server";
import { generateImage, generateAudio, generateVideo } from "@/lib/media-gen";
import path from "path";
import os from "os";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const { scenes, references, voiceId } = await req.json();

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
      const imageUrl = await generateImage(scene.imagePrompt, scene.mainReference, scene.secondaryReference);
      
      // Step B: Audio
      const audioPath = await generateAudio(scene.audioPrompt, voiceId || process.env.ELEVEN_LABS_VOICE_ID, tempDir);
      // In a real app, upload audioPath to storage and get URL
      
      // Step C: Video (Image to Video)
      const videoUrl = await generateVideo(imageUrl, scene.videoPrompt || "Cinematic movement");

      sceneResults.push({
        id: scene.id,
        imageUrl,
        audioUrl: `/api/audio?path=${encodeURIComponent(audioPath)}`,
        videoUrl
      });
    }

    return NextResponse.json({ referenceAssets, sceneResults });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Media generation error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate media" }, { status: 500 });
  }
}
