import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface AestheticLookbookProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const AestheticLookbookTemplate: React.FC<AestheticLookbookProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#fdf2f8", // Rose 50
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff", color: "#334155", fontFamily: "Outfit, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <LookbookScene 
              scene={scene} 
              productName={productName} 
              brandColor={brandColor} 
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const LookbookScene: React.FC<{ scene: Scene; productName: string; brandColor: string }> = ({
  scene,
  productName,
  brandColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig(); // width, height unused
  const sceneDuration = Math.round(4.0 * fps);
  
  const opacity = interpolate(frame, [0, 20, sceneDuration - 20, sceneDuration], [0, 1, 1, 0]);
  const slide = interpolate(frame, [0, sceneDuration], [0, -40]);

  return (
    <AbsoluteFill style={{ opacity, padding: "80px" }}>
      {/* Main Grid Layout */}
      <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: "40px",
          width: "100%",
          height: "100%",
          transform: `translateY(${slide}px)`
      }}>
          {/* Main Large Image */}
          <div style={{
              gridRow: "span 2",
              borderRadius: "40px",
              overflow: "hidden",
              boxShadow: "0 40px 80px rgba(0,0,0,0.05)",
              border: `10px solid ${brandColor}`
          }}>
              {scene.video_url ? (
                  <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : scene.image_url ? (
                  <img src={scene.image_url} alt="Main Lookbook" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
              ) : (
                  <div style={{ width: "100%", height: "100%", background: brandColor }} />
              )}
          </div>

          {/* Top Right: Product Info */}
          <div style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "40px"
          }}>
              <div style={{ fontSize: "14px", letterSpacing: "0.5em", opacity: 0.4, marginBottom: "20px" }}>EST_2026</div>
              <h2 style={{ fontSize: "72px", fontWeight: 200, margin: 0, letterSpacing: "-0.04em" }}>{productName}</h2>
              <div style={{ 
                  marginTop: "30px", 
                  width: "100px", 
                  height: "2px", 
                  backgroundColor: "#334155",
                  transform: `scaleX(${interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" })})`,
                  transformOrigin: "left"
              }} />
          </div>

          {/* Bottom Right: Secondary Shot */}
          <div style={{
              borderRadius: "40px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.03)",
              opacity: 0.8,
              transform: `scale(0.9) translateY(${slide * -0.5}px)`
          }}>
              {scene.image_url ? (
                  <img src={scene.image_url} alt="Secondary" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
              ) : (
                  <div style={{ width: "100%", height: "100%", background: "#f1f5f9" }} />
              )}
          </div>
      </div>

      {/* Floating Caption */}
      <div style={{
          position: "absolute",
          bottom: "120px",
          right: "120px",
          maxWidth: "350px",
          textAlign: "right",
          zIndex: 10
      }}>
          <p style={{ fontSize: "20px", lineHeight: 1.6, fontStyle: "italic", fontWeight: 300 }}>
             &quot;{scene.speech || "Curated for the discerning mind. A study in form, function, and absolute beauty."}&quot;
          </p>
      </div>

      {/* Aesthetic Border */}
      <div style={{
          position: "absolute",
          inset: "40px",
          border: "1px solid rgba(0,0,0,0.05)",
          pointerEvents: "none"
      }} />
    </AbsoluteFill>
  );
};
