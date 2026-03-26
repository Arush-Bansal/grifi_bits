import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface LogoTemplateProps {
  scenes?: Array<{ id: number; image_url?: string | null }>;
  productName?: string;
  brandColor?: string;
}

export const LogoTemplate: React.FC<LogoTemplateProps> = ({ 
  scenes = [], 
  productName = "Brand",
  brandColor = "#f97316"
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoUrl = scenes[0]?.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30";

  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 12,
    },
  });

  const scale = interpolate(entrance, [0, 1], [0, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ 
      backgroundColor: "white", 
      justifyContent: "center", 
      alignItems: "center" 
    }}>
      <div style={{
        transform: `scale(${scale})`,
        opacity: opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px"
      }}>
        <Img 
          src={logoUrl} 
          style={{ 
            width: 600,
            height: 600,
            objectFit: "contain"
          }} 
        />
        <div style={{
          fontSize: 48,
          fontWeight: 800,
          color: brandColor,
          fontFamily: "sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.1em"
        }}>
          {productName}
        </div>
      </div>
    </AbsoluteFill>
  );
};
