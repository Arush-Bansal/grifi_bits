export const TEMPLATE_IDS = [
  "ProductDemo",
  "ProductDemoVertical",
  "Minimalist",
  "DynamicSocial",
  "SplitScreen",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];
export type TemplateOrientation = "portrait" | "landscape";
export type TemplateTempo = "calm" | "balanced" | "high-energy";

export type TemplateMetadata = {
  label: string;
  description: string;
  orientation: TemplateOrientation;
  sceneDurationSeconds: number;
  tempo: TemplateTempo;
  orchestrationHint: string;
};

const TEMPLATE_ID_SET = new Set<string>(TEMPLATE_IDS);

export function isTemplateId(value: unknown): value is TemplateId {
  return typeof value === "string" && TEMPLATE_ID_SET.has(value);
}

export const DEFAULT_TEMPLATE_ID: TemplateId = "ProductDemo";

export const TEMPLATE_METADATA: Record<TemplateId, TemplateMetadata> = {
  ProductDemo: {
    label: "Product Demo",
    description: "Cinematic showcase with premium overlays for feature-led storytelling.",
    orientation: "landscape",
    sceneDurationSeconds: 3.4,
    tempo: "balanced",
    orchestrationHint: "Hero-first product storytelling with feature highlights and premium tone.",
  },
  ProductDemoVertical: {
    label: "Product Demo Vertical",
    description: "Vertical product hero format designed for reels and shorts.",
    orientation: "portrait",
    sceneDurationSeconds: 3.2,
    tempo: "balanced",
    orchestrationHint: "Vertical social-first product reveal with clear benefits and quick CTA.",
  },
  Minimalist: {
    label: "Minimalist",
    description: "Clean, editorial visual language with restrained motion and elegant typography.",
    orientation: "landscape",
    sceneDurationSeconds: 4.2,
    tempo: "calm",
    orchestrationHint: "Concise premium messaging with fewer words and calm pacing.",
  },
  DynamicSocial: {
    label: "Dynamic Social",
    description: "Punchy high-energy social format with fast transitions and bold copy.",
    orientation: "portrait",
    sceneDurationSeconds: 2.8,
    tempo: "high-energy",
    orchestrationHint: "Hook-driven short-form pacing with energetic, punchy, scroll-stopping copy.",
  },
  SplitScreen: {
    label: "Split Screen",
    description: "Alternating dual-panel layout for contrast, proof points, and comparisons.",
    orientation: "landscape",
    sceneDurationSeconds: 3.6,
    tempo: "balanced",
    orchestrationHint: "Use contrast and before/after framing with clear claims per scene.",
  },
};

export const TEMPLATE_PROMPT_CATALOG: Record<TemplateId, string> = {
  ProductDemo: `${TEMPLATE_METADATA.ProductDemo.description} (${TEMPLATE_METADATA.ProductDemo.orientation}).`,
  ProductDemoVertical: `${TEMPLATE_METADATA.ProductDemoVertical.description} (${TEMPLATE_METADATA.ProductDemoVertical.orientation}).`,
  Minimalist: `${TEMPLATE_METADATA.Minimalist.description} (${TEMPLATE_METADATA.Minimalist.orientation}).`,
  DynamicSocial: `${TEMPLATE_METADATA.DynamicSocial.description} (${TEMPLATE_METADATA.DynamicSocial.orientation}).`,
  SplitScreen: `${TEMPLATE_METADATA.SplitScreen.description} (${TEMPLATE_METADATA.SplitScreen.orientation}).`,
};

export function getTemplateIdsForOrientation(orientation: TemplateOrientation): TemplateId[] {
  return TEMPLATE_IDS.filter((id) => TEMPLATE_METADATA[id].orientation === orientation);
}
