import { NextRequest, NextResponse } from "next/server";
import { orchestrateAdPlan } from "@/lib/ai-orchestrator";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Database, Json } from "@/lib/supabase/database.types";

export async function POST(req: NextRequest) {
  try {
    const { product_id, product_name, product_description, image_names, selected_plan, settings } = await req.json();

    if (!product_name || !product_description) {
      return NextResponse.json({ error: "Product name and description are required" }, { status: 400 });
    }

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

        // 3. Insert new references
        const refInserts = plan.REFERENCE_SPECS.map(spec => ({
          project_id: product_id,
          reference_key: spec.id,
          label: spec.name,
          tagline: spec.description,
          ai_prompt: spec.prompt
        }));

        const uploadedInserts = (plan.UPLOADED_IMAGE_SPECS || []).map(spec => ({
          project_id: product_id,
          reference_key: `uploaded-${spec.original_name}`,
          label: spec.ai_name,
          tagline: spec.ai_description,
          original_name: spec.original_name
        }));

        await supabase.from("project_references").insert([...refInserts, ...uploadedInserts] as Database['public']['Tables']['project_references']['Insert'][]);

        // 4. Update the project record itself with the new structured data
        await supabase
          .from("projects")
          .update({
            scenes: scenesJson as unknown as Json,
            references: [
              ...refInserts.map(r => ({ ...r, image_url: "https://via.placeholder.com/300x300?text=Generating..." })),
              ...uploadedInserts.map(r => ({ ...r, image_url: "https://via.placeholder.com/300" }))
            ] as unknown as Json,
            updated_at: new Date().toISOString()
          })
          .eq("id", product_id);

        // 5. Fetch and return the "Full Project" object
        const { data: fullProject } = await supabase
          .from("projects")
          .select("*")
          .eq("id", product_id)
          .single();

        return NextResponse.json(fullProject);
      }
    }

    return NextResponse.json(plan);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Orchestration error:", err);
    return NextResponse.json({ error: err.message || "Failed to orchestrate ad plan" }, { status: 500 });
  }
}
