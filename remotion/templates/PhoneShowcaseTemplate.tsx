import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface PhoneShowcaseProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const PhoneShowcaseTemplate: React.FC<PhoneShowcaseProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#3b82f6",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(3.5 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f172a", color: "white", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Background decoration */}
      <AbsoluteFill style={{ 
        background: `radial-gradient(circle at 50% 50%, ${brandColor}22 0%, transparent 70%)`,
        opacity: 0.6
      }} />
      
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <PhoneScene 
              scene={scene} 
              productName={productName} 
              brandColor={brandColor} 
              isLast={index === scenes.length - 1}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const PhoneScene: React.FC<{ scene: Scene; productName: string; brandColor: string; isLast: boolean }> = ({
  scene,
  productName,
  brandColor,
  isLast,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const sceneDuration = Math.round(3.5 * fps);
  
  const entrance = spring({ frame, fps, config: { damping: 12, mass: 0.8 } });
  const scale = interpolate(entrance, [0, 1], [0.8, 1]);
  const translateY = interpolate(entrance, [0, 1], [100, 0]);
  const opacity = interpolate(frame, [0, 8, sceneDuration - 10, sceneDuration], [0, 1, 1, 0]);

  // Scroll animation for the media inside the phone
  const scrollY = interpolate(frame, [0, sceneDuration], [0, -40], { easing: Easing.bezier(0.33, 1, 0.68, 1) });

  return (
    <AbsoluteFill style={{ opacity, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: width > height ? "row" : "column", padding: "40px" }}>
      {/* Device Frame */}
      <div style={{
        width: width > height ? "320px" : "80%",
        aspectRatio: "9/19",
        backgroundColor: "#1e293b",
        borderRadius: "40px",
        padding: "12px",
        border: "4px solid #334155",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        transform: `scale(${scale}) translateY(${translateY}px)`,
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Notch */}
        <div style={{
          position: "absolute",
          top: "0",
          left: "50%",
          transform: "translateX(-50%)",
          width: "40%",
          height: "25px",
          backgroundColor: "#334155",
          borderBottomLeftRadius: "15px",
          borderBottomRightRadius: "15px",
          zIndex: 10
        }} />

        {/* Content Area */}
        <div style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#0f172a",
          borderRadius: "28px",
          overflow: "hidden",
          position: "relative"
        }}>
          <div style={{ transform: `translateY(${scrollY}px)`, height: "120%", width: "100%" }}>
            {scene.video_url ? (
              <OffthreadVideo
                src={scene.video_url}
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : scene.image_url ? (
              <img
                src={scene.image_url}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                alt="App Interface"
                crossOrigin="anonymous"
              />
            ) : (
              <AbsoluteFill style={{ background: `linear-gradient(to bottom, ${brandColor}, #1e2b4a)` }} />
            )}
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div style={{
        marginLeft: width > height ? "60px" : "0",
        marginTop: width > height ? "0" : "40px",
        maxWidth: width > height ? "50%" : "100%",
        textAlign: width > height ? "left" : "center"
      }}>
        <div style={{
          display: "inline-block",
          padding: "6px 16px",
          backgroundColor: `${brandColor}22`,
          border: `1px solid ${brandColor}`,
          borderRadius: "99px",
          color: brandColor,
          fontSize: "14px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "20px"
        }}>
          {isLast ? "Ready to launch" : productName}
        </div>
        
        <h2 style={{
          fontSize: width > height ? "48px" : "36px",
          fontWeight: 800,
          lineHeight: 1.1,
          margin: 0,
          color: "#f8fafc"
        }}>
          {scene.speech || "Experience the future of your workflow."}
        </h2>

        {/* Floating Bubble effect for secondary info */}
        {!isLast && (
          <div style={{
            marginTop: "30px",
            display: "flex",
            gap: "12px",
            justifyContent: width > height ? "flex-start" : "center"
          }}>
             <div style={{
                padding: "10px 18px",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "18px",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: "16px",
                color: "#94a3b8"
             }}>
                ✓ Smooth Performance
             </div>
             <div style={{
                padding: "10px 18px",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "18px",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: "16px",
                color: "#94a3b8"
             }}>
                ✓ Intuitive Design
             </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
