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

    // Save to database if product_id is provided
    if (product_id) {
      const supabase = createSupabaseAdmin();
      if (supabase) {
        // 1. Clear existing scenes and references for this project
        const { error: deleteScenesError } = await supabase.from("scenes").delete().eq("project_id", product_id);
        if (deleteScenesError) {
          throw new Error(`Failed to clear scenes: ${deleteScenesError.message}`);
        }
        // 2. Insert new scenes
        const imageUrls = (image_contexts || [])
          .map((ctx: { name: string; url: string }) => ctx.url)
          .filter((url: string) => typeof url === "string" && url.length > 0);

        const normalizedScenes = normalizeOrchestratorScenes(plan.SCENES, imageUrls);
        const sceneInserts = normalizedScenes.map((scene) => ({
          ...scene,
          project_id: product_id,
        }));

        const { error: insertScenesError } = await supabase.from("scenes").insert(sceneInserts);
        if (insertScenesError) {
          throw new Error(`Failed to insert scenes: ${insertScenesError.message}`);
        }

        // 3. Update the project record itself with the new structured data
        // Include the AI-selected template in settings
        const currentSettings = settings || {};
        const updatedSettings = {
          ...currentSettings,
          template_id: preferredTemplateId || plan.template_id
        };

        await supabase
          .from("projects")
          .update({
            scenes: sceneInserts.map((s) => ({ ...s, id: s.scene_order })) as unknown as Json,
            references: [] as unknown as Json,
            settings: updatedSettings as unknown as Json,
            updated_at: new Date().toISOString()
          })
          .eq("id", product_id);

        // 5. Fetch and return the absolute latest "Full Project" object with structured merge
        const { data: project } = await supabase
          .from("projects")
          .select("*")
          .eq("id", product_id)
          .single();

        const { data: scenes } = await supabase.from("scenes").select("*").eq("project_id", product_id).order("scene_order", { ascending: true });
        const { data: references } = await supabase.from("project_references").select("*").eq("project_id", product_id);

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
              })),
          references: (references || []).map(r => ({ ...r, id: r.reference_key }))
        };

        return NextResponse.json(mergedProject);
      }
    }

    return NextResponse.json(plan);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Orchestration error:", err);
    return NextResponse.json({ error: err.message || "Failed to orchestrate ad plan" }, { status: 500 });
  }
}
