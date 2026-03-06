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
};

export async function POST(request: Request) {
  const payload = (await request.json()) as ProjectPayload;

  if (!payload.productName || !payload.description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

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
      product_name: payload.productName,
      product_description: payload.description,
      image_names: payload.imageNames,
      selected_reference: payload.selectedReference,
      scenes: payload.scenes,
      captions_enabled: payload.captions,
      music_track: payload.music,
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
    .select("id, product_name, product_description, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
