import { Composition, registerRoot } from "remotion";
import { TEMPLATE_IDS, TemplateId } from "../lib/template-catalog";
import { getTemplateDurationInFrames, resolveTemplateConfig } from "./template-registry";

const DEFAULT_SCENES = [
  { id: 1, image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30", speech: "Experience premium quality like never before." },
  { id: 2, image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", speech: "Engineered for comfort and style." },
  { id: 3, image_url: "https://images.unsplash.com/photo-1526170315830-ef18a283ac16", speech: "Get yours today on Amazon and Blinkit!" },
];

const DEFAULT_PROPS_BY_TEMPLATE: Record<TemplateId, { productName: string; brandColor: string; scenes: typeof DEFAULT_SCENES }> = {
  ProductDemo: {
    productName: "Sample Product",
    brandColor: "#f97316",
    scenes: DEFAULT_SCENES,
  },
  ProductDemoVertical: {
    productName: "Sample Product",
    brandColor: "#f97316",
    scenes: DEFAULT_SCENES,
  },
  Minimalist: {
    productName: "Premium Minimal",
    brandColor: "#18181b",
    scenes: DEFAULT_SCENES,
  },
  DynamicSocial: {
    productName: "Social Star",
    brandColor: "#6366f1",
    scenes: DEFAULT_SCENES,
  },
  SplitScreen: {
    productName: "Split View",
    brandColor: "#ec4899",
    scenes: DEFAULT_SCENES,
  },
  LogoTemplate: {
    productName: "Brand Reveal",
    brandColor: "#000000",
    scenes: [DEFAULT_SCENES[0]],
  },
  PhoneShowcase: {
    productName: "Mobile App",
    brandColor: "#3b82f6",
    scenes: DEFAULT_SCENES,
  },
  BentoGrid: {
    productName: "Tech Gadget",
    brandColor: "#10b981",
    scenes: DEFAULT_SCENES,
  },
  AppleExplodedView: {
    productName: "Pro Max 3",
    brandColor: "#f97316",
    scenes: DEFAULT_SCENES,
  },
  ComparisonSlider: {
    productName: "Ultra Sharp",
    brandColor: "#3b82f6",
    scenes: DEFAULT_SCENES,
  },
  LiquidMorph: {
    productName: "Elixir Luxe",
    brandColor: "#ec4899",
    scenes: DEFAULT_SCENES,
  },
  SocialProofCarousel: {
    productName: "Trust Pilot",
    brandColor: "#6366f1",
    scenes: DEFAULT_SCENES,
  },
  Top5Countdown: {
    productName: "Mega Deal",
    brandColor: "#f43f5e",
    scenes: DEFAULT_SCENES,
  },
  UGCCallout: {
    productName: "Shop Now",
    brandColor: "#ef4444",
    scenes: DEFAULT_SCENES,
  },
  PaperPop: {
    productName: "Pop Gear",
    brandColor: "#10b981",
    scenes: DEFAULT_SCENES,
  },
  SimulatedUIWalkthrough: {
    productName: "Cloud Sync",
    brandColor: "#3b82f6",
    scenes: DEFAULT_SCENES,
  },
  DynamicDataDashboard: {
    productName: "OptiMetrics",
    brandColor: "#8b5cf6",
    scenes: DEFAULT_SCENES,
  },
  MinimalistBlueprint: {
    productName: "Axis Pro",
    brandColor: "#334155",
    scenes: DEFAULT_SCENES,
  },
  HolographicHUD: {
    productName: "Aero Core",
    brandColor: "#0ea5e9",
    scenes: DEFAULT_SCENES,
  },
  CinematicUnboxing: {
    productName: "Luxe Watch",
    brandColor: "#111827",
    scenes: DEFAULT_SCENES,
  },
  HighEnergyDrop: {
    productName: "Nitro X",
    brandColor: "#ef4444",
    scenes: DEFAULT_SCENES,
  },
  InfinityScroll: {
    productName: "Vogue",
    brandColor: "#f59e0b",
    scenes: DEFAULT_SCENES,
  },
  FeatureBinary: {
    productName: "NextGen",
    brandColor: "#3b82f6",
    scenes: DEFAULT_SCENES,
  },
  NeonNight: {
    productName: "Pulse",
    brandColor: "#f0abfc",
    scenes: DEFAULT_SCENES,
  },
  RetroVHS: {
    productName: "Static",
    brandColor: "#fde047",
    scenes: DEFAULT_SCENES,
  },
  Glassmorphism: {
    productName: "Clarity",
    brandColor: "#3b82f6",
    scenes: DEFAULT_SCENES,
  },
  ParallaxDepth: {
    productName: "Horizon",
    brandColor: "#6366f1",
    scenes: DEFAULT_SCENES,
  },
  AestheticLookbook: {
    productName: "Grace",
    brandColor: "#fdf2f8",
    scenes: DEFAULT_SCENES,
  },
  FoodieCloseUp: {
    productName: "Gourmet",
    brandColor: "#ea580c",
    scenes: DEFAULT_SCENES,
  },
  InteriorShowcase: {
    productName: "Dwelling",
    brandColor: "#44403c",
    scenes: DEFAULT_SCENES,
  },
  DailyRoutine: {
    productName: "Habit",
    brandColor: "#06b6d4",
    scenes: DEFAULT_SCENES,
  },
  WellnessFlow: {
    productName: "Serene",
    brandColor: "#fdf2f8",
    scenes: DEFAULT_SCENES,
  },
  MaterialFocus: {
    productName: "Veneer",
    brandColor: "#78350f",
    scenes: DEFAULT_SCENES,
  },
  MainAd: {
    productName: "Main Ad",
    brandColor: "#f97316",
    scenes: DEFAULT_SCENES.map(s => ({ ...s, template_id: "ProductDemoVertical" as const })),
  },
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {TEMPLATE_IDS.map((id) => {
        const config = resolveTemplateConfig(id);
        const defaultProps = DEFAULT_PROPS_BY_TEMPLATE[id];

        return (
          <Composition
            key={id}
            id={id}
            component={config.component}
            durationInFrames={getTemplateDurationInFrames(id, DEFAULT_SCENES.length, 30)}
            fps={30}
            width={config.width}
            height={config.height}
            defaultProps={defaultProps}
            calculateMetadata={({ props }: { props?: { scenes?: Array<{ id: number; template_id?: TemplateId }> } }) => {
              const currentScenes = props?.scenes || defaultProps?.scenes;
              
              if (id === "MainAd" && currentScenes) {
                let totalFrames = 0;
                currentScenes.forEach((scene: any) => {
                   // Match the fallback logic in MainAdTemplate
                   const tid = scene.template_id || "ProductDemoVertical";
                   const sceneConfig = resolveTemplateConfig(tid);
                   totalFrames += Math.round(sceneConfig.sceneDurationSeconds * 30);
                });
                return { durationInFrames: Math.max(30, totalFrames) };
              }

              const sceneCount = Array.isArray(currentScenes) && currentScenes.length > 0
                ? currentScenes.length
                : 3;

              return {
                durationInFrames: getTemplateDurationInFrames(id, sceneCount, 30),
              };
            }}
          />
        );
      })}
    </>
  );
};

registerRoot(RemotionRoot);
