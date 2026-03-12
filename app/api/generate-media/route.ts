import { NextRequest, NextResponse } from "next/server";
import { generateImage, generateAudio, getAudioDuration } from "@/lib/media-gen";
import { currentVideoGenerator } from "@/lib/video-gen";
import { uploadFileFromBuffer } from "@/lib/supabase/storage";
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

    // 1. Process References
    console.log("[GenerateAPI] Resolving Ref Images...");
    const referenceAssets: Record<string, string> = {};
    for (const [key, val] of Object.entries(references)) {
      const valStr = val as string;
      if (valStr.startsWith("http")) {
        referenceAssets[key] = valStr;
      } else {
        referenceAssets[key] = await generateImage(valStr);
      }
    }

    // 2. Generate Scenes (Image -> Audio -> Video)
    console.log("[GenerateAPI] Generating Scenes...");
    const sceneResults = [];
    for (const scene of scenes) {
      // Step A: Image
      let imageUrl = scene.image_url;
      const needsImage = !imageUrl || imageUrl.includes("Generating") || imageUrl.includes("placeholder") || !imageUrl.startsWith("http");
      
      if (needsImage) {
        console.log(`[GenerateAPI] Generating image for scene ${scene.id}...`);
        const mainRefUrl = scene.main_reference ? referenceAssets[scene.main_reference] || scene.main_reference : undefined;
        const secRefUrl = scene.secondary_reference ? referenceAssets[scene.secondary_reference] || scene.secondary_reference : undefined;
        imageUrl = await generateImage(scene.image_prompt, mainRefUrl, secRefUrl);
      } else {
        console.log(`[GenerateAPI] Skipping image generation for scene ${scene.id}, already exists: ${imageUrl}`);
      }
      
      // Step B: Audio
      let finalAudioUrl = scene.audio_url;
      let audioDuration = scene.audio_duration;
      const needsAudio = !finalAudioUrl || finalAudioUrl.includes("Generating") || !finalAudioUrl.startsWith("http") || !audioDuration;

      if (needsAudio) {
        console.log(`[GenerateAPI] Generating audio for scene ${scene.id}...`);
        const audioPath = await generateAudio(scene.speech, voice_id || process.env.ELEVEN_LABS_VOICE_ID, tempDir);
        audioDuration = await getAudioDuration(audioPath);
        
        const audioBuffer = fs.readFileSync(audioPath);
        const fileName = `audio_${Date.now()}_${Math.random().toString(36).substring(2)}.mp3`;
        const uploadedUrl = await uploadFileFromBuffer(audioBuffer, fileName, 'audio/mpeg');
        
        if (!uploadedUrl) {
            throw new Error(`Failed to upload audio for scene ${scene.id} to Supabase Storage.`);
        }
        finalAudioUrl = uploadedUrl;
      } else {
        console.log(`[GenerateAPI] Skipping audio generation for scene ${scene.id}, already exists: ${finalAudioUrl}`);
      }
      
      // Step C: Video (Image to Video)
      // We always attempt to generate video in this flow unless specified otherwise,
      // as "Generate Media" is usually driven by wanting the final video.
      const videoUrl = await currentVideoGenerator.generate({
        imageUrl,
        prompt: scene.video_prompt || "Cinematic movement",
        duration: 5,
        aspectRatio: "9:16"
      });

      sceneResults.push({
        id: scene.id,
        image_url: imageUrl,
        audio_url: finalAudioUrl,
        audio_duration: audioDuration,
        video_url: videoUrl
      });
    }

    return NextResponse.json({ referenceAssets, scene_results: sceneResults });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Media generation error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate media" }, { status: 500 });
  }
}
