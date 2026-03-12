import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export const sceneSchema = z.object({
  SCENES: z.array(z.object({
    name: z.string(),
    video_prompt: z.string(),
  })),
});

export const conceptSchema = z.object({
  concepts: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    imagePrompt: z.string(),
  })),
});

export type GeneratedPlan = z.infer<typeof sceneSchema>;
export type PlanConcept = z.infer<typeof conceptSchema>["concepts"][0];

export async function generateAdConcepts(productInfo: string): Promise<PlanConcept[]> {
  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: conceptSchema,
    prompt: `
      You are a creative director for a top e-commerce ad agency (Bits by Grifi).
      Generate 3 distinct creative concepts for a "Product Demo" video ad based on the following product:
      ${productInfo}
      
      Focus on these styles:
      1. **UGC Style**: Highly relatable, person-focused, "I tried this product" feel.
      2. **Cinematic Hero**: Sleek, high-production value, focusing on aesthetics and premium feel.
      3. **Problem-Solution**: Directly addresses a pain point and shows how the product solves it.

      Each concept should have:
      1. A catchy title.
      2. A short, compelling description of the ad's hook and flow.
      3. A detailed image prompt for a square (1:1) preview image that represents the visual style.
    `,
  });

  return object.concepts;
}

export async function orchestrateAdPlan(
  productInfo: string, 
  imageContext?: string[],
  selectedConcept?: string,
  duration: number = 20,
  language: string = "english"
): Promise<GeneratedPlan> {
  const imageContextText = imageContext && imageContext.length > 0 
    ? `\nReference Images Context:\n${imageContext.join("\n")}`
    : "";

  const conceptText = selectedConcept ? `\nFollow this Creative Concept: ${selectedConcept}` : "";

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"), 
    schema: sceneSchema,
    prompt: `
      You are an expert AI video advertisement director for "Bits by Grifi".
      Based on the product info, reference images, and selected concept, generate a structured sequence of scenes for a focus product demo.
      
      Product Info:
      ${productInfo}
      ${imageContextText}
      ${conceptText}
      
      Video Requirements:
      - Total Duration: Approximately ${duration} seconds.
      - Language: ${language}. All content MUST be in ${language}.
      - Style: High-quality, cinematic, realistic. 
      - **Focus**: The product should be the star. Highlight features, benefits, and local availability (Blinkit/Zepto context).
      
      Requirements:
      1. SCENES: A list of scenes with a clear name and a detailed video description (video_prompt).
      
      Ensure the plan highlights the product clearly and ends with a strong CTA.
    `,
  });

  return object;
}
