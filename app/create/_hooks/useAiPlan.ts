"use client";

import { useState } from "react";
import { PlanConcept, VideoSettings } from "../types";

export function useAiPlan() {
  const [plans, setPlans] = useState<PlanConcept[]>([]);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [settings, setSettings] = useState<VideoSettings>({
    orientation: "portrait",
    duration: 20,
    logoEnding: false,
    language: "english",
    captions: true,
    additionalInstructions: ""
  });

  return {
    plans, setPlans,
    selectedPlanIndex, setSelectedPlanIndex,
    settings, setSettings
  };
}
