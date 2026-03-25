"use client";

import { useMemo, useCallback } from "react";
import { VideoSettings } from "../types";
import { useProject } from "./useProject";

const DEFAULT_SETTINGS: VideoSettings = {
  orientation: "portrait",
  duration: 20,
  template_preference: "MainAd",
  template_id: "MainAd",
  brand_color: "#f97316",
};

export function useAiPlan() {
  const { projectData, updateCache } = useProject();

  const settings = useMemo(() => {
    const dbSettings = (projectData?.settings || {}) as Partial<VideoSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...dbSettings,
    };
  }, [projectData?.settings]);

  const setSettings = useCallback((newSettings: VideoSettings | ((prev: VideoSettings) => VideoSettings)) => {
    const next = typeof newSettings === "function" ? newSettings(settings) : newSettings;
    updateCache({ 
      settings: next,
    });
  }, [settings, updateCache]);

  return {
    settings, setSettings
  };
}
