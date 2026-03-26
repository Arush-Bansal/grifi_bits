export const TEMPLATE_IDS = [
  "ProductDemo",
  "ProductDemoVertical",
  "Minimalist",
  "DynamicSocial",
  "SplitScreen",
  "MinimalistVertical",
  "FlashSale",
  "KineticType",
  "StoryCards",
  "LuxuryShowcase",
  "BeforeAfter",
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
  MinimalistVertical: {
    label: "Minimalist Vertical",
    description: "Clean editorial format adapted for portrait/Stories with calm pacing and elegant typography.",
    orientation: "portrait",
    sceneDurationSeconds: 4.0,
    tempo: "calm",
    orchestrationHint: "Concise premium messaging with fewer words and calm pacing, optimized for vertical viewing.",
  },
  FlashSale: {
    label: "Flash Sale",
    description: "Urgency-driven flash sale format with countdown timer and deal-focused framing.",
    orientation: "portrait",
    sceneDurationSeconds: 2.6,
    tempo: "high-energy",
    orchestrationHint: "Write deal-focused copy: prices, discounts, limited-time language. Each scene should escalate urgency toward a buy-now CTA.",
  },
  KineticType: {
    label: "Kinetic Type",
    description: "Bold kinetic typography where words are the visual hero, ideal for benefit-led messaging.",
    orientation: "portrait",
    sceneDurationSeconds: 3.0,
    tempo: "high-energy",
    orchestrationHint: "Write punchy 3-6 word benefit statements per scene. Each word animates individually so brevity hits harder.",
  },
  StoryCards: {
    label: "Story Cards",
    description: "Card-swipe carousel format mimicking Instagram Stories with dot navigation indicators.",
    orientation: "portrait",
    sceneDurationSeconds: 3.0,
    tempo: "balanced",
    orchestrationHint: "Each scene is a distinct card. Write self-contained benefit statements. The viewer sees dot progress like story taps.",
  },
  LuxuryShowcase: {
    label: "Luxury Showcase",
    description: "Refined high-end aesthetic with restrained motion for premium and luxury products.",
    orientation: "landscape",
    sceneDurationSeconds: 4.5,
    tempo: "calm",
    orchestrationHint: "Write aspirational, understated copy. Short sentences. Avoid exclamation marks and discount language. Focus on craftsmanship and exclusivity.",
  },
  BeforeAfter: {
    label: "Before & After",
    description: "Transformation reveal with animated wipe, ideal for showing product results and comparisons.",
    orientation: "landscape",
    sceneDurationSeconds: 3.8,
    tempo: "balanced",
    orchestrationHint: "Structure scenes as problem/solution pairs. Odd scenes describe the problem, even scenes the benefit. Use contrast language.",
  },
};

export const TEMPLATE_PROMPT_CATALOG: Record<TemplateId, string> = {
  ProductDemo: `${TEMPLATE_METADATA.ProductDemo.description} (${TEMPLATE_METADATA.ProductDemo.orientation}).`,
  ProductDemoVertical: `${TEMPLATE_METADATA.ProductDemoVertical.description} (${TEMPLATE_METADATA.ProductDemoVertical.orientation}).`,
  Minimalist: `${TEMPLATE_METADATA.Minimalist.description} (${TEMPLATE_METADATA.Minimalist.orientation}).`,
  DynamicSocial: `${TEMPLATE_METADATA.DynamicSocial.description} (${TEMPLATE_METADATA.DynamicSocial.orientation}).`,
  SplitScreen: `${TEMPLATE_METADATA.SplitScreen.description} (${TEMPLATE_METADATA.SplitScreen.orientation}).`,
  MinimalistVertical: `${TEMPLATE_METADATA.MinimalistVertical.description} (${TEMPLATE_METADATA.MinimalistVertical.orientation}).`,
  FlashSale: `${TEMPLATE_METADATA.FlashSale.description} (${TEMPLATE_METADATA.FlashSale.orientation}).`,
  KineticType: `${TEMPLATE_METADATA.KineticType.description} (${TEMPLATE_METADATA.KineticType.orientation}).`,
  StoryCards: `${TEMPLATE_METADATA.StoryCards.description} (${TEMPLATE_METADATA.StoryCards.orientation}).`,
  LuxuryShowcase: `${TEMPLATE_METADATA.LuxuryShowcase.description} (${TEMPLATE_METADATA.LuxuryShowcase.orientation}).`,
  BeforeAfter: `${TEMPLATE_METADATA.BeforeAfter.description} (${TEMPLATE_METADATA.BeforeAfter.orientation}).`,
};

export function getTemplateIdsForOrientation(orientation: TemplateOrientation): TemplateId[] {
  return TEMPLATE_IDS.filter((id) => TEMPLATE_METADATA[id].orientation === orientation);
}
