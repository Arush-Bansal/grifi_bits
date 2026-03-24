import { NextRequest, NextResponse } from "next/server";
import { orchestrateAdPlan } from "@/lib/ai-orchestrator";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Json } from "@/lib/supabase/database.types";
import { normalizeOrchestratorScenes } from "@/lib/scene-normalization";
import { Scene } from "@/app/create/types";
import { TemplateId } from "@/lib/template-catalog";

export async function POST(req: NextRequest) {
  try {
    const { product_id, product_name, product_description, image_contexts, settings } = await req.json();

    if (!product_name || !product_description) {
      return NextResponse.json({ error: "Product name and description are required" }, { status: 400 });
    }

    const image_names = (image_contexts || []).map((ctx: { name: string; url: string }) => ctx.name);
    const productInfo = `Product: ${product_name}\nDescription: ${product_description}`;
    const preferredTemplateId: TemplateId | undefined =
      settings?.template_preference && settings.template_preference !== "auto"
        ? settings.template_preference
        : undefined;

    const plan = await orchestrateAdPlan(
      productInfo, 
      image_names, 
      settings?.duration,
      settings?.orientation,
      preferredTemplateId
    );

    const supabase = createSupabaseAdmin();
    if (!supabase) {
      throw new Error("Supabase admin client not available");
    }

    // AI returns SCENES. Each scene has its own template_id now. 
    // We pick the first one as a representative for the project settings if none preferred.
    const representativeTemplateId = preferredTemplateId || plan.SCENES[0]?.template_id || "ProductDemo";

    // 1. Determine or create the project ID
    let finalProjectId = product_id;
    if (!finalProjectId) {
      const { data: newProject, error: createError } = await supabase
        .from("projects")
        .insert({
          product_name,
          product_description,
          settings: {
            ...settings,
            template_id: representativeTemplateId
          } as unknown as Json,
        })
        .select("id")
        .single();

      if (createError) throw new Error(`Failed to create project: ${createError.message}`);
      finalProjectId = newProject.id;
    }

    // 2. Clear existing scenes if updating
    const { error: deleteScenesError } = await supabase.from("scenes").delete().eq("project_id", finalProjectId);
    if (deleteScenesError) {
      throw new Error(`Failed to clear scenes: ${deleteScenesError.message}`);
    }

    // 3. Normalize and Insert new scenes
    const imageUrls = (image_contexts || [])
      .map((ctx: { name: string; url: string }) => ctx.url)
      .filter((url: string) => typeof url === "string" && url.length > 0);

    // AI returns SCENES (caps), we use scenes (lowercase) in normalization helpers
    const normalizedScenes = normalizeOrchestratorScenes(plan.SCENES, imageUrls);
    const sceneInserts = normalizedScenes.map((scene) => ({
      ...scene,
      project_id: finalProjectId,
    }));

    let insertError: any = null;
    try {
      const { error } = await supabase.from("scenes").insert(sceneInserts);
      insertError = error;
    } catch (e) {
      insertError = e;
    }

    if (insertError) {
      console.warn("[Orchestrate] Failed to insert into 'scenes' table. This might be due to a missing 'template_id' column. Falling back to JSON-only storage.", insertError.message);
      
      // Fallback: Try inserting without template_id if it failed
      const safeInserts = sceneInserts.map(({ template_id, ...rest }: any) => rest);
      const { error: retryError } = await supabase.from("scenes").insert(safeInserts);
      
      if (retryError) {
        throw new Error(`Failed to insert scenes even after fallback: ${retryError.message}`);
      }
    }

    // 4. Update the project record with normalized settings and scenes JSON
    const updatedSettings = {
      ...(settings || {}),
      template_id: representativeTemplateId
    };

    const { data: project, error: updateError } = await supabase
      .from("projects")
      .update({
        scenes: sceneInserts.map((s) => ({ ...s, id: s.scene_order })) as unknown as Json,
        references: [] as unknown as Json,
        settings: updatedSettings as unknown as Json,
        updated_at: new Date().toISOString()
      })
      .eq("id", finalProjectId)
      .select("*")
      .single();

    if (updateError) throw new Error(`Failed to update project: ${updateError.message}`);

    // 5. Final Merged Response
    const { data: scenes } = await supabase
      .from("scenes")
      .select("*")
      .eq("project_id", finalProjectId)
      .order("scene_order", { ascending: true });
    
    const { data: references } = await supabase.from("project_references").select("*").eq("project_id", finalProjectId);

    const projectScenes = Array.isArray(project?.scenes) ? (project.scenes as unknown as Scene[]) : [];
    const mergedProject = {
      ...project,
      scenes: projectScenes.length > 0
        ? projectScenes.map((s) => {
            const ts = (scenes || []).find((row) => row.scene_order === s.id);
            return {
              ...s,
              image_url: ts?.image_url || s.image_url || null,
              audio_url: ts?.audio_url || s.audio_url || null,
              audio_duration: ts?.audio_duration || s.audio_duration || null,
              video_url: ts?.video_url || s.video_url || null,
              template_id: (ts as any)?.template_id || (s as any).template_id || null,
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
            template_id: (s as any).template_id || null,
          })),
      references: (references || []).map(r => ({ ...r, id: r.reference_key }))
    };

    return NextResponse.json(mergedProject);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Orchestration error:", err);
    return NextResponse.json({ error: err.message || "Failed to orchestrate ad plan" }, { status: 500 });
  }
}
