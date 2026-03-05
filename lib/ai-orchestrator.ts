import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export const sceneSchema = z.object({
  SCENES: z.array(z.object({
    name: z.string(),
    image_prompt: z.string(),
    video_prompt: z.string(),
    speech: z.string(),
    main_ref: z.string(),
    second_ref: z.string().optional().nullable(),
  })),
  REFERENCE_SPECS: z.record(z.string(), z.string()),
});

export type GeneratedPlan = z.infer<typeof sceneSchema>;

export async function orchestrateAdPlan(productInfo: string, imageContext?: string[]): Promise<GeneratedPlan> {
  const imageContextText = imageContext && imageContext.length > 0 
    ? `\nReference Images Context:\n${imageContext.join("\n")}`
    : "";

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"), 
    schema: sceneSchema,
    prompt: `
      You are an expert AI video advertisement director.
      Based on the following product info and reference concept, generate a structured sequence of scenes and the necessary reference image prompts.
      
      Product Info:
      ${productInfo}
      ${imageContextText}
      
      Requirements:
      1. SCENES: A list of scenes with detailed image and video prompts, speech, and references.
      2. REFERENCE_SPECS: A dictionary mapping reference keys (like 'girl', 'product', 'setting') to detailed image generation prompts.
      
      Ensure the plan is conversion-focused and follows UGC best practices.
    `,
  });

  return object;
}
