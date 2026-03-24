import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import {
  TEMPLATE_IDS,
  TEMPLATE_METADATA,
  TEMPLATE_PROMPT_CATALOG,
  TemplateId,
  TemplateOrientation,
  getTemplateIdsForOrientation,
} from "./template-catalog";

export const sceneSchema = z.object({
  SCENES: z.array(z.object({
    template_id: z.enum(TEMPLATE_IDS),
    name: z.string().min(1),
    video_prompt: z.string().min(1),
    speech: z.string().min(1),
  })).min(1),
});

export type GeneratedPlan = z.infer<typeof sceneSchema>;


export async function orchestrateAdPlan(
  productInfo: string, 
  imageContext?: string[],
  duration: number = 20,
  orientation: TemplateOrientation = "portrait",
  preferredTemplateId?: TemplateId
): Promise<GeneratedPlan> {
  const templateListText = TEMPLATE_IDS.filter(id => !TEMPLATE_METADATA[id].isContainer).map((id) => {
    const template = TEMPLATE_METADATA[id];
    return `- "${id}" (${template.orientation}, ${template.tempo}, ${template.sceneDurationSeconds}s/scene): ${TEMPLATE_PROMPT_CATALOG[id]} Hint: ${template.orchestrationHint}`;
  }).join("\n");

  const orientationTemplateIds = getTemplateIdsForOrientation(orientation);
  const portraitTemplateIds = getTemplateIdsForOrientation("portrait");
  const landscapeTemplateIds = getTemplateIdsForOrientation("landscape");
  const preferredTemplateText = preferredTemplateId
    ? `\nTemplate preference from user: "${preferredTemplateId}". You should favor this template for most scenes unless another one specifically fits better.`
    : "\nNo fixed template preference provided. Pick the best template for each scene that matches orientation and product context.";

  const imageContextText = imageContext && imageContext.length > 0 
    ? `\nReference Images Context:\n${imageContext.join("\n")}`
    : "";

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"), 
    schema: sceneSchema,
    prompt: `
      You are an expert AI video advertisement director for "Bits by Grifi".
      Based on the product info, reference images, and orientation, generate a structured sequence of scenes for a Focus video.
      
      Product Info:
      ${productInfo}
      ${imageContextText}
      ${preferredTemplateText}
      
      Video Requirements:
      - Total Duration: Approximately ${duration} seconds.
      - Orientation: ${orientation}.
      - Style: Distinctive, premium, modern. Avoid generic slideshow feel.
      - **Focus**: The product should be the star. Highlight features, benefits, and local availability (Blinkit/Zepto context).
      
      Template Selection Strategy (CRITICAL):
      1. For EACH scene, you MUST select a "template_id" from the catalog.
      2. Analyze the product category and brand tone (e.g., Luxury, Utility, High-Energy, Professional).
      3. Match the tone of EACH scene to the most appropriate template from this list:
         ${templateListText}
      4. Variety is key: Mix templates to create a dynamic flow. If a scene shows reviews, use "SocialProofCarousel". If it shows features, use "BentoGrid" or "ProductDemo". If it's a reveal, use "PaperPop".
      
      Template orientation rules:
      - If orientation is portrait, choose ONLY from: ${portraitTemplateIds.map((id) => `"${id}"`).join(", ")}.
      - If orientation is landscape, choose ONLY from: ${landscapeTemplateIds.map((id) => `"${id}"`).join(", ")}.
      - For this request specifically, orientation is ${orientation}; choose ONLY from ${orientationTemplateIds.map((id) => `"${id}"`).join(", ")}.

      Scene Requirements:
      1. SCENES: A list of scenes with:
         - template_id: The specific visual style for this scene.
         - name: clear scene title
         - video_prompt: detailed visual direction for this specific scene
         - speech: short on-screen spoken line/caption for the scene; 6-14 words, punchy, no filler
      
      Creative quality rules (important):
      - Each scene should have a clear visual action, not just "show product".
      - Vary camera language across scenes (macro/detail, medium, wide, angle shifts, motion cues).
      - Keep copy specific and benefit-led; avoid generic adjectives like "amazing" without proof.
      - End with a decisive CTA tailored for fast-commerce purchase intent.
    `,
  });

  return object;
}
