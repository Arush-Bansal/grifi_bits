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

  return NextResponse.json(data);
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

