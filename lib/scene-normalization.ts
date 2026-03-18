import { Database } from "@/lib/supabase/database.types";

type SceneInsert = Database["public"]["Tables"]["scenes"]["Insert"];

export type OrchestratorScene = {
  name: string;
  video_prompt: string;
  speech?: string;
};

export function normalizeOrchestratorScenes(
  scenes: OrchestratorScene[],
  imageUrls: string[] = []
): SceneInsert[] {
  return scenes.map((scene, index) => {
    const order = index + 1;
    const normalizedName = scene.name?.trim() || `Scene ${order}`;
    const normalizedPrompt = scene.video_prompt?.trim() || normalizedName;
    const normalizedSpeech = scene.speech?.trim() || normalizedPrompt;
    const imageUrl = imageUrls.length > 0 ? imageUrls[index % imageUrls.length] : null;

    return {
      scene_order: order,
      name: normalizedName,
      video_prompt: normalizedPrompt,
      speech: normalizedSpeech,
      image_url: imageUrl,
      image_prompt: null,
      audio_url: null,
      audio_duration: null,
      video_url: null,
      main_reference: null,
      secondary_reference: null,
    };
  });
}

