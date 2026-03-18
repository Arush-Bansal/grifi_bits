"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Scene, EditingPrompt } from "../types";
import { TIMELINE_FLOAT_TOLERANCE } from "../constants";
import { buildInitialTimelineClips } from "../_utils";
import { useProject } from "./useProject";

export function useSceneState() {
  const { projectData, uiState, updateCache, updateUiCache } = useProject();
  
  const scenes = useMemo(() => {
    const rawScenes = projectData?.scenes || [];
    return rawScenes.map((scene, index) => ({
      ...scene,
      id: scene.id ?? index + 1
    }));
  }, [projectData?.scenes]);
  const timelineClips = useMemo(() => {
    if (projectData?.scenes && projectData.scenes.length > 0) {
      return buildInitialTimelineClips(projectData.scenes);
    }
    return [];
  }, [projectData?.scenes]);

  const [timelineCurrentTime, setTimelineCurrentTime] = useState(0);
  const [timelineIsPlaying, setTimelineIsPlaying] = useState(false);
  
  const sceneGenerating = useMemo(() => uiState.sceneGenerating, [uiState.sceneGenerating]);
  const editingImagePrompt = useMemo(() => uiState.editingImagePrompt, [uiState.editingImagePrompt]);
  

  const timelineTotalDuration = useMemo(
    () => timelineClips.reduce((maxValue, clip) => Math.max(maxValue, clip.end), 0),
    [timelineClips]
  );

  const activeTimelineClip = useMemo(
    () =>
      timelineClips.find(
        (clip, index) =>
          timelineCurrentTime >= clip.start &&
          (timelineCurrentTime < clip.end ||
            (index === timelineClips.length - 1 && timelineCurrentTime <= clip.end + TIMELINE_FLOAT_TOLERANCE))
      ) ?? null,
    [timelineClips, timelineCurrentTime]
  );

  useEffect(() => {
    setTimelineCurrentTime((prev) => Math.min(prev, timelineTotalDuration));
  }, [timelineTotalDuration]);

  const setScenes = useCallback((newScenes: Scene[] | ((prev: Scene[]) => Scene[])) => {
    updateCache((old) => {
      const currentScenes = old.scenes || [];
      const next = typeof newScenes === "function" ? newScenes(currentScenes) : newScenes;
      return { scenes: next };
    });
  }, [updateCache]);

  const updateScene = useCallback((sceneId: number, key: "image_prompt" | "speech" | "video_prompt", value: string) => {
    setScenes((prev) => prev.map((scene) => (scene.id === sceneId ? { ...scene, [key]: value } : scene)));
  }, [setScenes]);


  const handleTimelineClipsChange = useCallback(() => {
    // We don't save timeline clips directly yet, but we normalize them
  }, []);

  const handleTimelineTimeChange = useCallback((nextTime: number) => {
    const bounded = Number(Math.max(0, Math.min(nextTime, timelineTotalDuration)).toFixed(2));
    setTimelineCurrentTime(bounded);
  }, [timelineTotalDuration]);

  return {
    scenes,
    setScenes,
    timelineClips,
    setTimelineClips: () => {}, // Disabled for now as it's derived
    timelineCurrentTime,
    setTimelineCurrentTime,
    timelineIsPlaying,
    setTimelineIsPlaying,
    sceneGenerating,
    editingImagePrompt,
    setEditingImagePrompt: (val: EditingPrompt | ((prev: EditingPrompt) => EditingPrompt)) => {
      updateUiCache((old) => {
        const current = old.editingImagePrompt || {};
        const next = typeof val === "function" ? val(current) : val;
        return { editingImagePrompt: next };
      });
    },
    updateScene,
    timelineTotalDuration,
    activeTimelineClip,
    handleTimelineClipsChange,
    handleTimelineTimeChange
  };
}
