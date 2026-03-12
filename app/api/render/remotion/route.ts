import { NextRequest, NextResponse } from "next/server";
import { renderLogoVideo, renderProductDemo } from "@/lib/remotion-renderer/render";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { logoUrl, productDemoData } = body;

    let videoUrl = "";

    if (productDemoData) {
      console.log("[API Render] Rendering Product Demo with template:", productDemoData.templateId || "ProductDemo");
      videoUrl = await renderProductDemo(productDemoData);
    } else if (logoUrl) {
      console.log("[API Render] Rendering Logo...");
      videoUrl = await renderLogoVideo(logoUrl);
    } else {
      return NextResponse.json({ error: "logoUrl or productDemoData is required" }, { status: 400 });
    }

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
