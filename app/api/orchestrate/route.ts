import { NextRequest, NextResponse } from "next/server";
import { orchestrateAdPlan } from "@/lib/ai-orchestrator";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Database, Json } from "@/lib/supabase/database.types";

export async function POST(req: NextRequest) {
  try {
    const { product_id, product_name, product_description, image_contexts, selected_plan, settings } = await req.json();

    if (!product_name || !product_description) {
      return NextResponse.json({ error: "Product name and description are required" }, { status: 400 });
    }

    const image_names = (image_contexts || []).map((ctx: { name: string; url: string }) => ctx.name);
    const productInfo = `Product: ${product_name}\nDescription: ${product_description}`;
    const plan = await orchestrateAdPlan(
      productInfo, 
      image_names, 
      selected_plan, 
      settings?.duration, 
      settings?.language
    );

    // Save to database if product_id is provided
    if (product_id) {
      const supabase = createSupabaseAdmin();
      if (supabase) {
        // 1. Clear existing scenes and references for this project
        await supabase.from("scenes").delete().eq("project_id", product_id);
        await supabase.from("project_references").delete().eq("project_id", product_id);

        // 2. Insert new scenes
        const sceneInserts = plan.SCENES.map((scene, index) => ({
          project_id: product_id,
          name: scene.name,
          image_prompt: scene.image_prompt,
          video_prompt: scene.video_prompt,
          speech: scene.speech,
          scene_order: index + 1,
          main_reference: scene.main_ref,
          secondary_reference: scene.second_ref
        }));
        await supabase.from("scenes").insert(sceneInserts as Database['public']['Tables']['scenes']['Insert'][]);

        // 2.5 Add frontend `id` field based on `scene_order` for JSON representation
        const scenesJson = sceneInserts.map(scene => ({
          ...scene,
          id: scene.scene_order
        }));

        // 3. Insert new references (deduplicated by reference_key)
        const uniqueRefSpecs = Array.from(new Map(plan.REFERENCE_SPECS.map(spec => [spec.id, spec])).values());
        const refInserts = uniqueRefSpecs.map(spec => ({
          project_id: product_id,
          reference_key: spec.id,
          label: spec.name,
          tagline: spec.description,
          ai_prompt: spec.prompt,
          image_url: null
        }));

        const uniqueUploadedSpecs = Array.from(new Map((plan.UPLOADED_IMAGE_SPECS || []).map(spec => [spec.original_name, spec])).values());
        const uploadedInserts = uniqueUploadedSpecs.map(spec => {
          const context = (image_contexts || []).find((ctx: { name: string; url: string }) => ctx.name === spec.original_name);
          return {
            project_id: product_id,
            reference_key: `uploaded-${spec.original_name}`,
            label: spec.ai_name,
            tagline: spec.ai_description,
            original_name: spec.original_name,
            image_url: context?.url || null
          };
        });

        await supabase.from("project_references").insert([...refInserts, ...uploadedInserts] as Database['public']['Tables']['project_references']['Insert'][]);

        // 4. Update the project record itself with the new structured data
        // Ensure 'id' is present for frontend hooks
        const referencesJson = [
          ...refInserts.map(r => ({ ...r, id: r.reference_key })),
          ...uploadedInserts.map(r => ({ ...r, id: r.reference_key }))
        ];

        await supabase
          .from("projects")
          .update({
            scenes: scenesJson as unknown as Json,
            references: referencesJson as unknown as Json,
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

        const mergedProject = {
          ...project,
          scenes: (scenes || []).map(s => ({ ...s, id: s.scene_order })),
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
