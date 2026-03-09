"use client";

import { useState } from "react";
import { useStepState } from "./useStepState";

export function useUIState() {
  const [isAiAvatarLibraryOpen, setIsAiAvatarLibraryOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const stepState = useStepState();

  return {
    ...stepState,
    isAiAvatarLibraryOpen,
    setIsAiAvatarLibraryOpen,
    lightboxImage,
    setLightboxImage
  };
}
