"use client";

import React, { createContext, useState, ReactNode } from "react";

export interface UIStateContextType {
  lightboxImage: string | null;
  setLightboxImage: React.Dispatch<React.SetStateAction<string | null>>;
}

export const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

export function UIStateProvider({ children }: { children: ReactNode }) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  return (
    <UIStateContext.Provider value={{ lightboxImage, setLightboxImage }}>
      {children}
    </UIStateContext.Provider>
  );
}
