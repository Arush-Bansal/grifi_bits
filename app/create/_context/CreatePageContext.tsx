"use client";

import React, { createContext, useContext } from "react";
import { useCreatePageState } from "../_hooks/useCreatePageState";

type CreatePageState = ReturnType<typeof useCreatePageState>;

const CreatePageContext = createContext<CreatePageState | null>(null);

export function CreatePageProvider({ children }: { children: React.ReactNode }) {
  const state = useCreatePageState();

  return (
    <CreatePageContext.Provider value={state}>
      {children}
    </CreatePageContext.Provider>
  );
}

export function useCreatePageContext() {
  const context = useContext(CreatePageContext);
  if (!context) {
    throw new Error("useCreatePageContext must be used within a CreatePageProvider");
  }
  return context;
}
