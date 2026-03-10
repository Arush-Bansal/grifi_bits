import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/database.types";

// Use the types directly from our new definition
import { ProjectData } from "@/app/create/types";

export async function POST(request: Request) {
  const payload = (await request.json()) as ProjectData;

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      {
        error: "Supabase is not configured.",
        hint: "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
      },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from("projects")
    .upsert({
      ...payload,
      updated_at: new Date().toISOString()
    } as Database['public']['Tables']['projects']['Insert'])
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Authoritative merge after upsert: text from JSONB payload, assets from structured tables
  const idResult = (data as Database['public']['Tables']['projects']['Row'])?.id;
  if (!idResult) {
    return NextResponse.json(data);
  }
  const { data: scenes } = await supabase.from("scenes").select("*").eq("project_id", idResult).order("scene_order", { ascending: true });
  const { data: references } = await supabase.from("project_references").select("*").eq("project_id", idResult);
  
  const jsonScenes = payload.scenes || [];
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

  const jsonRefs = payload.references || [];
  const mergedRefs = jsonRefs.map(jr => {
    const tr = (references || []).find(r => r.reference_key === jr.id);
    return {
      ...jr,
      image_url: tr?.image_url || jr.image_url,
    };
  });

  const mergedProject = {
    ...data,
    scenes: mergedScenes,
    references: mergedRefs
  };

  return NextResponse.json(mergedProject);
}

export async function GET() {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

