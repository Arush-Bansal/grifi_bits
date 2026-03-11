import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const LogoTemplate: React.FC<{ logoUrl: string }> = ({ logoUrl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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
      </div>
    </AbsoluteFill>
  );
};
