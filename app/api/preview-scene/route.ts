import { NextRequest, NextResponse } from "next/server";
import { generateImage, generateAudio, getAudioDuration } from "@/lib/media-gen";
import path from "path";
import os from "os";
import fs from "fs";

export async function POST(req: NextRequest) {
    try {
        const { type, imagePrompt, audioScript, voiceId, mainReference, secondaryReference } = await req.json();

        if (!type || !["image", "audio", "both"].includes(type)) {
            return NextResponse.json(
                { error: 'Field "type" is required and must be "image", "audio", or "both".' },
                { status: 400 }
            );
        }

        let imageUrl: string | undefined;
        let audioUrl: string | undefined;
        let audioDuration: number | undefined;

        // Generate image
        if (type === "image" || type === "both") {
            if (!imagePrompt) {
                return NextResponse.json({ error: "imagePrompt is required for image generation." }, { status: 400 });
            }
            console.log("[PreviewScene] Generating image…");
            imageUrl = await generateImage(imagePrompt, mainReference, secondaryReference);
        }

        // Generate audio
        if (type === "audio" || type === "both") {
            if (!audioScript) {
                return NextResponse.json({ error: "audioScript is required for audio generation." }, { status: 400 });
            }
            const tempDir = path.join(os.tmpdir(), "orbit-gen", Date.now().toString());
            fs.mkdirSync(tempDir, { recursive: true });

            const resolvedVoiceId = voiceId || process.env.ELEVEN_LABS_VOICE_ID;
            console.log("[PreviewScene] Generating audio…");
            const audioPath = await generateAudio(audioScript, resolvedVoiceId, tempDir);
            audioUrl = `/api/audio?path=${encodeURIComponent(audioPath)}`;
            audioDuration = await getAudioDuration(audioPath);
        }

        return NextResponse.json({ imageUrl, audioUrl, audioDuration });
    } catch (error: unknown) {
        const err = error as Error;
        console.error("[PreviewScene] Error:", err);
        return NextResponse.json({ error: err.message || "Failed to generate preview." }, { status: 500 });
    }
}
