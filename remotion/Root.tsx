import { Composition, registerRoot } from "remotion";
import { ProductDemoTemplate } from "./templates/ProductDemoTemplate";
import { MinimalistTemplate } from "./templates/MinimalistTemplate";
import { DynamicSocialTemplate } from "./templates/DynamicSocialTemplate";
import { SplitScreenTemplate } from "./templates/SplitScreenTemplate";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ProductDemo"
        component={ProductDemoTemplate}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          productName: "Sample Product",
          brandColor: "#f97316",
          scenes: [
            { id: 1, image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30", speech: "Experience premium quality like never before." },
            { id: 2, image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", speech: "Engineered for comfort and style." },
            { id: 3, image_url: "https://images.unsplash.com/photo-1526170315830-ef18a283ac16", speech: "Get yours today on Amazon and Blinkit!" }
          ]
        } as any}
      />

      <Composition
        id="Minimalist"
        component={MinimalistTemplate}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          productName: "Premium Minimal",
          brandColor: "#18181b",
          scenes: [
            { id: 1, image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30", speech: "Elegance in every detail." },
            { id: 2, image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", speech: "Designed for the modern lifestyle." }
          ]
        } as any}
      />

      <Composition
        id="DynamicSocial"
        component={DynamicSocialTemplate}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          productName: "Social Star",
          brandColor: "#6366f1",
          scenes: [
            { id: 1, image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30", speech: "Don't miss out on this!" },
            { id: 2, image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", speech: "Swipe up to shop now." }
          ]
        } as any}
      />

      <Composition
        id="SplitScreen"
        component={SplitScreenTemplate}
        durationInFrames={500}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          productName: "Split View",
          brandColor: "#ec4899",
          scenes: [
            { id: 1, image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30", speech: "Perfectly balanced design." },
            { id: 2, image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", speech: "See it from both sides." }
          ]
        } as any}
      />

      <Composition
        id="ProductDemoVertical"
        component={ProductDemoTemplate}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          productName: "Sample Product",
          brandColor: "#f97316",
          scenes: [
            { id: 1, image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30", speech: "Experience premium quality like never before." },
            { id: 2, image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", speech: "Engineered for comfort and style." },
            { id: 3, image_url: "https://images.unsplash.com/photo-1526170315830-ef18a283ac16", speech: "Get yours today on Amazon and Blinkit!" }
          ]
        } as any}
      />
    </>
  );
};

registerRoot(RemotionRoot);
