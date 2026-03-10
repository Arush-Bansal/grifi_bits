import { NextRequest, NextResponse } from "next/server";
import { generateImage, generateAudio, getAudioDuration } from "@/lib/media-gen";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import path from "path";
import os from "os";
import fs from "fs";

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        console.log("[PreviewScene] Incoming payload:", payload);
        const { 
          type, 
          image_prompt, 
          speech, 
          voice_id, 
          main_reference, 
          secondary_reference,
          project_id,
          reference_id,
          scene_id
        } = payload;

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
            if (!image_prompt) {
                return NextResponse.json({ error: "image_prompt is required for image generation." }, { status: 400 });
            }
            console.log("[PreviewScene] Generating image…");
            imageUrl = await generateImage(image_prompt, main_reference, secondary_reference);
            console.log("[PreviewScene] Image URL generated:", imageUrl);
        }

        // Generate audio
        if (type === "audio" || type === "both") {
            if (!speech) {
                return NextResponse.json({ error: "speech is required for audio generation." }, { status: 400 });
            }
            const tempDir = path.join(os.tmpdir(), "orbit-gen", Date.now().toString());
            fs.mkdirSync(tempDir, { recursive: true });

            const resolvedVoiceId = voice_id || process.env.ELEVEN_LABS_VOICE_ID;
            console.log("[PreviewScene] Generating audio with voice:", resolvedVoiceId);
            const audioPath = await generateAudio(speech, resolvedVoiceId, tempDir);
            console.log("[PreviewScene] Audio path:", audioPath);
            audioUrl = `/api/audio?path=${encodeURIComponent(audioPath)}`;
            audioDuration = await getAudioDuration(audioPath);
            console.log("[PreviewScene] Audio duration:", audioDuration);
        }

        // --- PERSISTENCE LOGIC ---
        if (project_id && (imageUrl || audioUrl)) {
            const supabase = createSupabaseAdmin();
            if (supabase) {
                if (reference_id) {
                    console.log(`[PreviewScene] Attempting persistence for reference: ${reference_id} in project: ${project_id}`);
                    const { data: updateData, error: updateError, count } = await supabase
                        .from("project_references")
                        .update({ image_url: imageUrl })
                        .eq("project_id", project_id)
                        .eq("reference_key", reference_id)
                        .select();
                    
                    if (updateError) {
                        console.error(`[PreviewScene] Error updating project_references:`, updateError);
                    } else {
                        console.log(`[PreviewScene] Successfully updated project_references for ${reference_id}. Rows affected: ${count || (updateData ? updateData.length : 0)}`);
                    }
                } else if (scene_id) {
                    console.log(`[PreviewScene] Attempting persistence for scene: ${scene_id} in project: ${project_id}`);
                    const { data: updateData, error: updateError, count } = await supabase
                        .from("scenes")
                        .update({ 
                            image_url: imageUrl || undefined,
                            audio_url: audioUrl || undefined,
                            audio_duration: audioDuration || undefined
                        })
                        .eq("project_id", project_id)
                        .eq("scene_order", scene_id)
                        .select();

                    if (updateError) {
                        console.error(`[PreviewScene] Error updating scenes:`, updateError);
                    } else {
                        console.log(`[PreviewScene] Successfully updated scenes for order ${scene_id}. Rows affected: ${count || (updateData ? updateData.length : 0)}`);
                    }
                }
            }
        }

        return NextResponse.json({ image_url: imageUrl, audio_url: audioUrl, audio_duration: audioDuration });
    } catch (error: unknown) {
        const err = error as Error;
        console.error("[PreviewScene] Error Stack:", err.stack);
        return NextResponse.json({ 
          error: err.message || "Failed to generate preview.",
          details: err.stack 
        }, { status: 500 });
    }
}
