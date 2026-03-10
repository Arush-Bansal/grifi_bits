"use client";

import React, { createContext, useState, ReactNode } from "react";

export interface UIStateContextType {
  isAiAvatarLibraryOpen: boolean;
  setIsAiAvatarLibraryOpen: React.Dispatch<React.SetStateAction<boolean>>;
  lightboxImage: string | null;
  setLightboxImage: React.Dispatch<React.SetStateAction<string | null>>;
}

export const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

export function UIStateProvider({ children }: { children: ReactNode }) {
  const [isAiAvatarLibraryOpen, setIsAiAvatarLibraryOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  return (
    <UIStateContext.Provider value={{ isAiAvatarLibraryOpen, setIsAiAvatarLibraryOpen, lightboxImage, setLightboxImage }}>
      {children}
    </UIStateContext.Provider>
  );
}
