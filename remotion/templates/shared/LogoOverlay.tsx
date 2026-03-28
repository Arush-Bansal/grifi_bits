import React from "react";
import { Img } from "remotion";

interface LogoOverlayProps {
  logoUrl?: string;
  size?: number;
  opacity?: number;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export const LogoOverlay: React.FC<LogoOverlayProps> = ({
  logoUrl,
  size = 60,
  opacity = 0.8,
  position = "bottom-right",
}) => {
  if (!logoUrl) return null;

  const positionStyles: React.CSSProperties = {
    "bottom-right": { bottom: 20, right: 20 },
    "bottom-left": { bottom: 20, left: 20 },
    "top-right": { top: 20, right: 20 },
    "top-left": { top: 20, left: 20 },
  }[position];

  return (
    <div
      style={{
        position: "absolute",
        ...positionStyles,
        zIndex: 100,
        opacity,
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
      }}
    >
      <Img
        src={logoUrl}
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          borderRadius: 8,
        }}
      />
    </div>
  );
};
