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
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {TEMPLATE_IDS.map((id) => {
        const config = resolveTemplateConfig(id);
        return (
          <Composition
            key={id}
            id={id}
            component={config.component}
            durationInFrames={getTemplateDurationInFrames(id, DEFAULT_SCENES.length, 30)}
            fps={30}
            width={config.width}
            height={config.height}
            defaultProps={DEFAULT_PROPS_BY_TEMPLATE[id] as any}
            calculateMetadata={({ props }: { props?: { scenes?: Array<{ id: number }> } }) => {
              const sceneCount = Array.isArray(props?.scenes) && props.scenes.length > 0
                ? props.scenes.length
                : DEFAULT_PROPS_BY_TEMPLATE[id].scenes.length;

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
