import { NextRequest, NextResponse } from "next/server";
import { generateAdConcepts } from "@/lib/ai-orchestrator";
import { generateImage } from "@/lib/media-gen";

export async function POST(req: NextRequest) {
  try {
    const { product_name, product_description } = await req.json();

    if (!product_name || !product_description) {
      return NextResponse.json({ error: "Product name and description are required" }, { status: 400 });
    }

    const productInfo = `Product: ${product_name}\nDescription: ${product_description}`;
    const concepts = await generateAdConcepts(productInfo);

    // Generate square preview images for each concept
    const conceptsWithImages = await Promise.all(
      concepts.map(async (concept: { id: string; title: string; description: string; image_prompt?: string; imagePrompt?: string }) => {
        try {
          const image_preview = await generateImage(concept.image_prompt || concept.imagePrompt || "", undefined, undefined, "1:1");
          return { 
            id: concept.id,
            title: concept.title,
            description: concept.description,
            image_prompt: concept.image_prompt || concept.imagePrompt,
            image_preview 
          };
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
