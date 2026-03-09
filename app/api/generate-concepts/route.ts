import { NextRequest, NextResponse } from "next/server";
import { generateAdConcepts } from "@/lib/ai-orchestrator";
import { generateImage } from "@/lib/media-gen";

export async function POST(req: NextRequest) {
  try {
    const { productName, description } = await req.json();

    if (!productName || !description) {
      return NextResponse.json({ error: "Product name and description are required" }, { status: 400 });
    }

    const productInfo = `Product: ${productName}\nDescription: ${description}`;
    const concepts = await generateAdConcepts(productInfo);

    // Generate square preview images for each concept
    const conceptsWithImages = await Promise.all(
      concepts.map(async (concept) => {
        try {
          const imagePreview = await generateImage(concept.imagePrompt, undefined, undefined, "1:1");
          return { ...concept, imagePreview };
        } catch (error) {
          console.error("Failed to generate concept image:", error);
          return concept;
        }
      })
    );

    return NextResponse.json({ concepts: conceptsWithImages });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Concept generation error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate concepts" }, { status: 500 });
  }
}
