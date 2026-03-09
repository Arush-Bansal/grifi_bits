"use client";

import { X } from "lucide-react";

interface LightboxProps {
  lightboxImage: string | null;
  setLightboxImage: (url: string | null) => void;
}

export function Lightbox({ lightboxImage, setLightboxImage }: LightboxProps) {
  if (!lightboxImage) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={() => setLightboxImage(null)}
    >
      <button
        type="button"
        onClick={() => setLightboxImage(null)}
        className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition-colors cursor-pointer z-10"
      >
        <X className="h-6 w-6" />
      </button>
      <div
        className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={lightboxImage}
          alt="Full-size preview"
          className="max-h-[90vh] max-w-[90vw] object-contain"
        />
      </div>
    </div>
  );
}
