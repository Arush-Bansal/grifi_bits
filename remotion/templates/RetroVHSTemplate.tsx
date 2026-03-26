import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface RetroVHSProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const RetroVHSTemplate: React.FC<RetroVHSProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#fde047", // Vintage Yellow
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", color: "#fff", fontFamily: "Courier New, monospace" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <VHScene 
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

const VHScene: React.FC<{ scene: Scene; productName: string; brandColor: string }> = ({
  scene,
  productName,
  brandColor,
}) => {
  const frame = useCurrentFrame();
  const { height, fps } = useVideoConfig(); // width unused
  const sceneDuration = Math.round(4.0 * fps);
  
  // VHS Artifacts
  const trackingPos = (frame * 5) % height;
  const chromaticOffset = 2 + Math.sin(frame / 2) * 2;
  const opacity = interpolate(frame, [0, 10, sceneDuration - 10, sceneDuration], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Chromatic Aberration Layers */}
      <AbsoluteFill style={{ opacity: 0.5, left: -chromaticOffset, filter: "brightness(2) contrast(1.5)" }}>
          {scene.video_url ? (
               <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : scene.image_url ? (
               <img src={scene.image_url} alt="VHS R" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
          ) : null}
      </AbsoluteFill>
      
      <AbsoluteFill style={{ mixBlendMode: "screen", filter: "contrast(1.2)" }}>
           {scene.video_url ? (
              <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : scene.image_url ? (
              <img src={scene.image_url} alt="VHS G" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
          ) : (
              <div style={{ width: "100%", height: "100%", background: "#111" }} />
          )}
      </AbsoluteFill>

      {/* VHS Noise Overlay */}
      <AbsoluteFill style={{ 
          backgroundImage: "url('https://media.giphy.com/media/oEI9uWUicKgR6X7Apm/giphy.gif')", 
          opacity: 0.1, 
          mixBlendMode: "overlay",
          pointerEvents: "none"
      }} />

      {/* Tracking Line */}
      <div style={{
          position: "absolute",
          top: trackingPos,
          left: 0,
          right: 0,
          height: "2px",
          backgroundColor: "white",
          opacity: 0.2,
          boxShadow: "0 0 10px white",
          zIndex: 40
      }} />

      {/* Retro OSD (On-Screen Display) */}
      <div style={{
          position: "absolute",
          top: "60px",
          left: "60px",
          fontSize: "24px",
          textShadow: "2px 2px 0px rgba(0,0,0,0.5)",
          zIndex: 50
      }}>
          <div style={{ color: brandColor, fontWeight: 900 }}>PLAY ▶</div>
          <div style={{ marginTop: "10px" }}>00:0{Math.floor(frame / fps)}:00</div>
          <div style={{ fontSize: "16px", marginTop: "20px", opacity: 0.8 }}>{productName.toUpperCase()}</div>
      </div>

      <div style={{
           position: "absolute",
           bottom: "60px",
           right: "60px",
           fontSize: "24px",
           textAlign: "right",
           zIndex: 50,
           textShadow: "2px 2px 0px rgba(0,0,0,0.5)"
      }}>
          <div style={{ color: brandColor }}>SP</div>
          <div style={{ marginTop: "10px", fontSize: "14px", opacity: 0.6 }}>OCT 18 1994</div>
      </div>

      {/* Subtitles (Captions) */}
      <div style={{
          position: "absolute",
          bottom: "100px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(0,0,0,0.7)",
          padding: "10px 20px",
          fontSize: "20px",
          color: "#fff",
          textAlign: "center",
          width: "max-content",
          maxWidth: "80%",
          zIndex: 50
      }}>
          {scene.speech || "The future of the past. Remastered for today."}
      </div>

      {/* Vignette & Grain */}
      <div style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 0 0 150px rgba(0,0,0,0.8)",
          pointerEvents: "none"
      }} />

    </AbsoluteFill>
  );
};
