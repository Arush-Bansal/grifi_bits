"use client";

import { useState } from "react";
import { PlanConcept, VideoSettings } from "../types";

export function useAiPlan() {
  const [plans, setPlans] = useState<PlanConcept[]>([]);
  const [selected_plan_index, setSelectedPlanIndex] = useState(0);
  const [settings, setSettings] = useState<VideoSettings>({
    orientation: "portrait",
    duration: 20,
    logoEnding: false,
    language: "english",
    captions: true,
    additionalInstructions: "",
    musicTrack: "ambient-glow"
  });

  return {
    plans, setPlans,
    selected_plan_index, setSelectedPlanIndex,
    settings, setSettings
  };
}
