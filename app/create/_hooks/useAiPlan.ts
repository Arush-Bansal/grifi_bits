"use client";

import { useMemo, useCallback } from "react";
import { PlanConcept, VideoSettings } from "../types";
import { useProject } from "./useProject";

const DEFAULT_SETTINGS: VideoSettings = {
  orientation: "portrait",
  duration: 20,
  logo_ending: false,
  language: "english",
  captions_enabled: true,
  additional_instructions: "",
  music_track: "ambient-glow"
};

export function useAiPlan() {
  const { projectData, updateCache } = useProject();

  const plans = useMemo(() => projectData?.plans || [], [projectData?.plans]);
  const selected_plan_index = useMemo(() => projectData?.selected_plan_index ?? 0, [projectData?.selected_plan_index]);
  
  const settings = useMemo(() => {
    const dbSettings = (projectData?.settings || {}) as Partial<VideoSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...dbSettings,
      captions_enabled: projectData?.captions_enabled ?? dbSettings.captions_enabled ?? DEFAULT_SETTINGS.captions_enabled,
      music_track: projectData?.music_track || dbSettings.music_track || DEFAULT_SETTINGS.music_track
    };
  }, [projectData?.settings, projectData?.captions_enabled, projectData?.music_track]);

  const custom_concept = useMemo(() => settings.custom_concept, [settings.custom_concept]);

  const setPlans = useCallback((newPlans: PlanConcept[]) => {
    updateCache({ plans: newPlans });
  }, [updateCache]);

  const setSelectedPlanIndex = useCallback((index: number) => {
    updateCache({ selected_plan_index: index });
  }, [updateCache]);

  const setSettings = useCallback((newSettings: VideoSettings | ((prev: VideoSettings) => VideoSettings)) => {
    const next = typeof newSettings === "function" ? newSettings(settings) : newSettings;
    updateCache({ 
      settings: next,
      captions_enabled: next.captions_enabled,
      music_track: next.music_track
    });
  }, [settings, updateCache]);

  const setCustomConcept = useCallback((concept: PlanConcept) => {
    setSettings({ ...settings, custom_concept: concept });
  }, [settings, setSettings]);

  return {
    plans, setPlans,
    selected_plan_index, setSelectedPlanIndex,
    custom_concept, setCustomConcept,
    settings, setSettings
  };
}
