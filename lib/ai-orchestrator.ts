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
  REFERENCE_SPECS: z.array(z.object({
    id: z.string().describe("A unique identifier for this reference image (e.g., 'brand_logo', 'hero_character'). MUST be unique."),
    name: z.string().describe("A short snake_case identifier for the image"),
    description: z.string().describe("A brief description of what this image represents"),
    prompt: z.string().describe("A detailed image generation prompt. For characters, MUST specify 'realistic' and 'Indian' style.")
  })),
  UPLOADED_IMAGE_SPECS: z.array(z.object({
    original_name: z.string(),
    ai_name: z.string().describe("Short snake_case name for the user's uploaded image"),
    ai_description: z.string().describe("Short description for the user's uploaded image")
  })).optional(),
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
      You are a creative director for a top ad agency.
      Generate 3 distinct creative concepts for a video ad based on the following product:
      ${productInfo}
      
      Each concept should have:
      1. A catchy title.
      2. A short, compelling description of the ad's hook and flow.
      3. A detailed image prompt for a square (1:1) preview image that represents the visual style of this concept.
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
      You are an expert AI video advertisement director.
      Based on the product info, reference images, and selected concept, generate a structured sequence of scenes.
      
      Product Info:
      ${productInfo}
      ${imageContextText}
      ${conceptText}
      
      Video Requirements:
      - Total Duration: Approximately ${duration} seconds.
      - Language: ${language}. All speech content MUST be in ${language}.
      - Style: High-quality, cinematic, realistic. ALL characters MUST look Indian.
      
      Requirements:
      1. SCENES: A list of scenes with detailed image and video prompts, speech, and references. All characters in scenes MUST follow the reference specs.
      2. REFERENCE_SPECS: A list of objects for each MANDATORY reference needed. You MUST generate separate references for:
         - The BRAND or PRODUCT (e.g., 'product_shot', 'brand_logo').
         - MAIN CHARACTERS from the script (e.g., 'main_host', 'customer'). 
         - ALL characters MUST look Indian and realistic.
         - Each object MUST include:
            - id: A unique key (e.g., 'main_character', 'setting').
            - name: A short, descriptive name in snake_case (e.g., 'cheerful_woman', 'modern_office').
            - description: A one-sentence description.
            - prompt: A highly detailed image generation prompt. Include "realistic Indian" style for all people.
         - CRITICAL: Do NOT blend multiple characters or objects into a single reference. Keep them separate.
      3. UPLOADED_IMAGE_SPECS: For EACH image name provided in the reference context, provide a better snake_case name and description based on the filename (e.g., 'product-front.jpg' -> ai_name: 'product_hero', ai_description: 'A clear front-facing shot of the product').
      
      Ensure the plan is conversion-focused and follows UGC best practices.
    `,
  });

  return object;
}
