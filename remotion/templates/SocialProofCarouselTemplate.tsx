import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface SocialProofCarouselProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

const REVIEWS = [
  { author: "Sarah J.", text: "Absolutely changed my morning routine. 10/10!", stars: 5 },
  { author: "Mike R.", text: "The build quality is just on another level.", stars: 5 },
  { author: "Elena W.", text: "Finally a product that actually delivers.", stars: 4 },
];

export const SocialProofCarouselTemplate: React.FC<SocialProofCarouselProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#6366f1",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.2 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0c", color: "white", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <CarouselScene 
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

const CarouselScene: React.FC<{ scene: Scene; productName: string; brandColor: string; isLast: boolean }> = ({
  scene,
  productName,
  brandColor,
  isLast,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const sceneDuration = Math.round(4.2 * fps);
  
  const entrance = spring({ frame, fps, config: { damping: 12 } });
  const opacity = interpolate(frame, [0, 10, sceneDuration - 10, sceneDuration], [0, 1, 1, 0]);

  // Carousel rotation
  const rotation = interpolate(frame, [0, sceneDuration], [0, -15], { easing: Easing.out(Easing.quad) });

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Product Highlight (Left/Center) */}
      <div style={{
          position: "absolute",
          left: width > height ? "10%" : "50%",
          top: width > height ? "50%" : "30%",
          transform: width > height ? "translateY(-50%)" : "translate(-50%, -50%)",
          width: width > height ? "40%" : "80%",
          aspectRatio: "1/1",
          borderRadius: "40px",
          overflow: "hidden",
          boxShadow: `0 40px 100px -20px ${brandColor}44`,
          border: "2px solid rgba(255,255,255,0.1)",
          zIndex: 5
      }}>
          {scene.video_url ? (
              <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : scene.image_url ? (
              <img src={scene.image_url} alt="Product" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
          ) : (
              <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${brandColor}, #000)` }} />
          )}
      </div>

      {/* Rotating Review Cards (Right) */}
      <div style={{
          position: "absolute",
          right: width > height ? "5%" : "50%",
          top: width > height ? "50%" : "70%",
          transform: width > height ? `translateY(-50%) rotate(${rotation}deg)` : `translate(-50%, -50%) rotate(${rotation}deg)`,
          width: width > height ? "45%" : "90%",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
      }}>
          {REVIEWS.map((review, i) => {
              const cardEntrance = spring({ frame: frame - i * 5, fps, config: { damping: 15 } });
              return (
                  <div key={review.author} style={{
                      backgroundColor: "rgba(255,255,255,0.03)",
                      backdropFilter: "blur(20px)",
                      borderRadius: "24px",
                      padding: "24px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      transform: `translateX(${interpolate(cardEntrance, [0, 1], [100, 0])}px)`,
                      opacity: cardEntrance
                  }}>
                      <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
                          {[...Array(5)].map((_, starI) => (
                              <span key={starI} style={{ color: starI < review.stars ? "#fbbf24" : "#3f3f46" }}>★</span>
                          ))}
                      </div>
                      <p style={{ margin: 0, fontSize: "18px", fontStyle: "italic", color: "#e4e4e7", lineHeight: 1.5 }}>
                          "{review.text}"
                      </p>
                      <div style={{ marginTop: "16px", fontWeight: 700, color: brandColor, textTransform: "uppercase", fontSize: "14px", letterSpacing: "0.1em" }}>
                          — {review.author}
                      </div>
                  </div>
              );
          })}
      </div>

      {/* Brand Label */}
      <div style={{
          position: "absolute",
          bottom: "5%",
          left: "5%",
          fontSize: "24px",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          opacity: 0.6
      }}>
          {isLast ? "TRUSTED BY THOUSANDS" : productName}
      </div>
    </AbsoluteFill>
  );
};
