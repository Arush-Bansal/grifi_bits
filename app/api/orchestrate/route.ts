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
        let sceneOrder = 1;
        const sceneInserts = [];

        // Add Logo Animation if possible (using settings or just prepend for now)
        if (settings?.logo_url) {
          sceneInserts.push({
            project_id: product_id,
            name: "Logo Animation",
            image_prompt: "Opening logo animation",
            video_prompt: "Logo animation",
            speech: "Welcome to Orbit AI.",
            scene_order: sceneOrder++,
            main_reference: "logo",
            secondary_reference: null,
            // We can store the rendered video URL once it's available or trigger it here
          });
        }

        plan.SCENES.forEach((scene) => {
          sceneInserts.push({
            project_id: product_id,
            name: scene.name,
            video_prompt: scene.video_prompt,
            scene_order: sceneOrder++,
            image_prompt: "",
            speech: "",
            main_reference: null,
            secondary_reference: null
          });
        });

        await supabase.from("scenes").insert(sceneInserts as Database['public']['Tables']['scenes']['Insert'][]);

        // 2.5 Add frontend `id` field based on `scene_order` for JSON representation
        const scenesJson = sceneInserts.map(scene => ({
          ...scene,
          id: scene.scene_order
        }));

        // 3. Update the project record itself with the new structured data
        await supabase
          .from("projects")
          .update({
            scenes: scenesJson as unknown as Json,
            references: [] as unknown as Json, // Clearing references as they are no longer generated
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
