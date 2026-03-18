import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Database, Json } from "@/lib/supabase/database.types";

// Use the types directly from our new definition
import { ProjectData, ReferenceCard, Scene } from "@/app/create/types";

function toArray<T>(value: Json | null | undefined): T[] {
  return Array.isArray(value) ? (value as unknown as T[]) : [];
}

export async function POST(request: Request) {
  const payload = (await request.json()) as ProjectData;
  const hasScenePayload = Array.isArray(payload.scenes) && payload.scenes.length > 0;
  const hasReferencePayload = Array.isArray(payload.references) && payload.references.length > 0;

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

  const projectUpsertPayload: Database['public']['Tables']['projects']['Insert'] = {
    id: payload.id,
    product_name: payload.product_name,
    product_description: payload.product_description,
    settings: payload.settings as unknown as Json,
    updated_at: new Date().toISOString()
  };

  if (hasScenePayload) {
    projectUpsertPayload.scenes = payload.scenes as unknown as Json;
  }

  if (hasReferencePayload) {
    projectUpsertPayload.references = payload.references as unknown as Json;
  }

  const { data, error } = await supabase
    .from("projects")
    .upsert(projectUpsertPayload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const idResult = (data as Database['public']['Tables']['projects']['Row'])?.id;
  if (!idResult) {
    return NextResponse.json(data);
  }

  // Sync structured tables with JSON data to prevent "authoritative merge" from reverting changes
  if (hasScenePayload) {
    // Delete and re-insert for simplicity and to handle re-ordering
    await supabase.from("scenes").delete().eq("project_id", idResult);
    const sceneInserts = payload.scenes!.map((scene, index) => {
      const sceneOrder = scene.id ?? index + 1;
      return {
        project_id: idResult,
        scene_order: sceneOrder,
        name: scene.name || `Scene ${index + 1}`,
        image_prompt: scene.image_prompt || "",
        video_prompt: scene.video_prompt || scene.speech || "",
        speech: scene.speech || scene.video_prompt || "",
        image_url: scene.image_url || null,
        audio_url: scene.audio_url || null,
        audio_duration: scene.audio_duration || null,
        video_url: scene.video_url || null,
        main_reference: scene.main_reference || null,
        secondary_reference: scene.secondary_reference || null,
      };
    });
    await supabase.from("scenes").insert(sceneInserts);
  }

  if (hasReferencePayload) {
    await supabase.from("project_references").delete().eq("project_id", idResult);
    const refInserts = payload.references!.map(ref => ({
      project_id: idResult,
      reference_key: ref.id,
      label: ref.label,
      tagline: ref.tagline,
      image_url: ref.image_url,
      ai_prompt: ref.ai_prompt || null,
      original_name: ref.original_name || null
    }));
    await supabase.from("project_references").insert(refInserts);
  }

  // Authoritative merge after upsert: text from JSONB payload, assets from structured tables
  const { data: scenes } = await supabase.from("scenes").select("*").eq("project_id", idResult).order("scene_order", { ascending: true });
  const { data: references } = await supabase.from("project_references").select("*").eq("project_id", idResult);
  
  const jsonScenes = payload.scenes || toArray<Scene>(data.scenes);
  const mergedScenes = jsonScenes.length > 0
    ? jsonScenes.map(js => {
        const ts = (scenes || []).find(s => s.scene_order === js.id);
        return {
          ...js,
          image_url: ts?.image_url || js.image_url,
          audio_url: ts?.audio_url || js.audio_url,
          audio_duration: ts?.audio_duration || js.audio_duration,
          video_url: ts?.video_url || js.video_url,
        };
      })
    : (scenes || []).map((s) => ({
        id: s.scene_order,
        name: s.name || `Scene ${s.scene_order}`,
        video_prompt: s.video_prompt || s.name || "",
        speech: s.speech || s.video_prompt || "",
        image_url: s.image_url,
        audio_url: s.audio_url,
        audio_duration: s.audio_duration,
        video_url: s.video_url,
        main_reference: s.main_reference,
        secondary_reference: s.secondary_reference,
      }));

  const jsonRefs = payload.references || toArray<ReferenceCard>(data.references);
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
