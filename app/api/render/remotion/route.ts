import { NextRequest, NextResponse } from "next/server";
import { renderLogoVideo } from "@/lib/remotion-renderer/render";

export async function POST(req: NextRequest) {
  try {
    const { logoUrl } = await req.json();

    if (!logoUrl) {
      return NextResponse.json({ error: "logoUrl is required" }, { status: 400 });
    }

    const videoUrl = await renderLogoVideo(logoUrl);
    
    return NextResponse.json({ 
      success: true, 
      videoUrl: videoUrl
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[API Render] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to render video" }, { status: 500 });
  }
}
