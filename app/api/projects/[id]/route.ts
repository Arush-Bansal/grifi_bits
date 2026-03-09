import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  // Fetch project basic data
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (projectError) {
    return NextResponse.json({ error: projectError.message }, { status: 404 });
  }

  // Fetch related scenes
  const { data: scenesData } = await supabase
    .from("scenes")
    .select("*")
    .eq("project_id", id)
    .order("scene_order", { ascending: true });

  // Fetch related references
  const { data: refsData } = await supabase
    .from("project_references")
    .select("*")
    .eq("project_id", id);

  // Map database structures to frontend structures
  const scenes = ((scenesData || []) as any[]).map(s => ({
    id: s.scene_order,
    db_id: s.id, // Keep the real ID just in case
    name: s.name,
    imagePrompt: s.image_prompt || "",
    videoScript: s.video_prompt || "",
    audioPrompt: s.speech || "",
    imageUrl: s.image_url || undefined,
    videoUrl: s.video_url || undefined,
    audioUrl: s.audio_url || undefined,
    audioDuration: s.audio_duration || undefined,
    mainReference: s.main_reference || undefined,
    secondaryReference: s.secondary_reference || undefined
  }));

  const references = ((refsData || []) as any[]).map(r => ({
    id: r.reference_key,
    db_id: r.id,
    label: r.label || "",
    tagline: r.tagline || "",
    image: r.image_url || "https://via.placeholder.com/300",
    aiPrompt: r.ai_prompt || undefined,
    originalName: r.original_name || undefined
  }));

  // Return combined data, prioritizing the structured data over JSONB blobs
  return NextResponse.json({
    ...(project as any),
    scenes: (scenes.length > 0 ? scenes : (project as any).scenes) || [],
    references: (references.length > 0 ? references : (project as any).references) || []
  });
}

