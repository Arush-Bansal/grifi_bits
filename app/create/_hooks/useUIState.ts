"use client";

import { useContext } from "react";
import { useStepState } from "./useStepState";
import { UIStateContext } from "../_components/ui-state-provider";

export function useUIState() {
  const context = useContext(UIStateContext);
  if (!context) {
    throw new Error("useUIState must be used within a UIStateProvider");
  }

  const stepState = useStepState();

  return {
    ...context,
    ...stepState
  };
}
