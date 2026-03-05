import { NextRequest, NextResponse } from "next/server";
import { orchestrateAdPlan } from "@/lib/ai-orchestrator";

export async function POST(req: NextRequest) {
  try {
    const { productName, description, imageNames } = await req.json();

    if (!productName || !description) {
      return NextResponse.json({ error: "Product name and description are required" }, { status: 400 });
    }

    const productInfo = `Product: ${productName}\nDescription: ${description}`;
    const plan = await orchestrateAdPlan(productInfo, imageNames);

    return NextResponse.json(plan);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Orchestration error:", err);
    return NextResponse.json({ error: err.message || "Failed to orchestrate ad plan" }, { status: 500 });
  }
}
