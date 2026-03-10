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

  // 1. Fetch structured scenes
  const { data: scenes } = await supabase
    .from("scenes")
    .select("*")
    .eq("project_id", id)
    .order("scene_order", { ascending: true });

  // 2. Fetch structured references
  const { data: references } = await supabase
    .from("project_references")
    .select("*")
    .eq("project_id", id);

  // 5. Construct merged scenes: authoritative text from JSONB, authoritative assets from structured table
  const jsonScenes = (project.scenes as any[] || []);
  const mergedScenes = jsonScenes.map(js => {
    const ts = (scenes || []).find(s => s.scene_order === js.id);
    return {
      ...js,
      image_url: ts?.image_url || js.image_url,
      audio_url: ts?.audio_url || js.audio_url,
      audio_duration: ts?.audio_duration || js.audio_duration,
      video_url: ts?.video_url || js.video_url,
    };
  });

  // 6. Construct merged references: authoritative text from JSONB, authoritative assets from structured table
  const jsonRefs = (project.references as any[] || []);
  const mergedRefs = jsonRefs.map(jr => {
    const tr = (references || []).find(r => r.reference_key === jr.id);
    return {
      ...jr,
      image_url: tr?.image_url || jr.image_url,
    };
  });

  const consolidatedProject = {
    ...project,
    scenes: mergedScenes,
    references: mergedRefs
  };

  return NextResponse.json(consolidatedProject);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  // Delete associated scenes and references first (if not handled by cascade)
  // In this schema, we'll manually delete to be safe.
  await supabase.from("scenes").delete().eq("project_id", id);
  await supabase.from("project_references").delete().eq("project_id", id);
  
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

