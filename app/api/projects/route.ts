import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";

type ProjectPayload = {
  id?: string;
  productName: string;
  description: string;
  imageNames: string[];
  selectedReference: string | null;
  scenes: Array<{ id: number; name: string; imagePrompt: string; videoScript: string; audioPrompt: string }>;
  captions: boolean;
  music: string;
  references?: Array<{
    id: string;
    label: string;
    tagline: string;
    image: string;
    aiPrompt?: string;
  }>;
  plans?: Array<{
    id: string;
    title: string;
    description: string;
    imagePrompt: string;
    imagePreview?: string;
  }>;
  selectedPlanIndex?: number;
  settings?: {
    orientation: "landscape" | "portrait";
    duration: number;
    logoEnding: boolean;
    language: string;
    captions: boolean;
    additionalInstructions?: string;
  };
};

export async function POST(request: Request) {
  const payload = (await request.json()) as ProjectPayload;

  // Relaxed validation for initial creation
  const productName = payload.productName || "Untitled Project";
  const productDescription = payload.description || "";

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
      id: payload.id, // Supabase will insert if undefined, or update if matches
      product_name: productName,
      product_description: productDescription,
      image_names: payload.imageNames || [],
      selected_reference: payload.selectedReference || null,
      scenes: payload.scenes || [],
      references: payload.references || [],
      plans: payload.plans || [],
      selected_plan_index: payload.selectedPlanIndex || 0,
      settings: payload.settings || {},
      captions_enabled: payload.captions ?? true,
      music_track: payload.music || "ambient-glow",
      updated_at: new Date().toISOString()
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ projectId: data.id }, { status: 200 });
}
export async function GET() {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("projects")
    .select("id, product_name, product_description, created_at, plans, selected_plan_index, settings")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
