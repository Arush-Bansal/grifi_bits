"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Scene, EditingPrompt, SceneGenerating } from "../types";
import { TIMELINE_FLOAT_TOLERANCE } from "../constants";
import { buildInitialTimelineClips } from "../_utils";
import { usePreviewSceneMutation } from "./index";
import { useProject } from "./useProject";

export function useSceneState() {
  const { projectId, projectData, uiState, updateCache, updateUiCache } = useProject();
  
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
  
  const [isGeneratingAllImages, setIsGeneratingAllImages] = useState(false);

  const previewSceneMutation = usePreviewSceneMutation();

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

  const handleGenerateSceneImage = useCallback(async (sceneId: number, image_prompt: string, main_ref?: string, secondary_ref?: string, options?: { referenceId?: string }) => {
    if (!image_prompt) return {};

    updateUiCache((old) => {
      const sg = (old.sceneGenerating || {}) as SceneGenerating;
      const idStr = options?.referenceId ? `ref-${options.referenceId}` : sceneId.toString();
      return { sceneGenerating: { ...sg, [idStr]: { ...sg[idStr], image: true } } };
    });

    try {
      const data = await previewSceneMutation.mutateAsync({ 
        type: "image", 
        image_prompt,
        main_reference: main_ref,
        secondary_reference: secondary_ref,
        project_id: projectId || undefined,
        reference_id: options?.referenceId,
        scene_id: options?.referenceId ? undefined : (sceneId || undefined)
      });

      if (data.image_url) {
        if (options?.referenceId) {
          // Update references in cache if it's a reference generation
          updateCache((old) => ({
            ...old,
            references: (old.references || []).map((r) =>
              r.id === options.referenceId ? { ...r, image_url: data.image_url as string } : r
            ),
          }));
        } else {
          // Update scenes in cache
          setScenes((prev) =>
            prev.map((s) => (s.id === sceneId ? { ...s, image_url: data.image_url } : s))
          );
        }
      }
      return data;
    } catch (error) {
      console.error(`[useSceneState] handleGenerateSceneImage failed for ${options?.referenceId || sceneId}:`, error);
      throw error;
    } finally {
      updateUiCache((old) => {
        const sg = (old.sceneGenerating || {}) as SceneGenerating;
        const idStr = options?.referenceId ? `ref-${options.referenceId}` : sceneId.toString();
        const next = { ...sg };
        if (next[idStr]) {
          next[idStr] = { ...next[idStr], image: false };
        }
        return { sceneGenerating: next };
      });
    }
  }, [previewSceneMutation, updateUiCache, setScenes, projectId, updateCache]);


  const handleGenerateAllImages = useCallback(async () => {
    setIsGeneratingAllImages(true);
    try {
      const validScenes = scenes.filter((scene: Scene) => scene.image_prompt?.trim());
      if (!validScenes.length) return;
      await Promise.all(
        validScenes.map((scene: Scene) =>
          handleGenerateSceneImage(
            scene.id,
            scene.image_prompt,
            scene.main_reference,
            scene.secondary_reference
          )
        )
      );
    } catch (error) {
      console.error("Bulk image generation failed:", error);
    } finally {
      setIsGeneratingAllImages(false);
    }
  }, [scenes, handleGenerateSceneImage]);

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
    isGeneratingAllImages,
    timelineTotalDuration,
    activeTimelineClip,
    updateScene,
    handleGenerateSceneImage,
    handleGenerateAllImages,
    handleTimelineClipsChange,
    handleTimelineTimeChange
  };
}
