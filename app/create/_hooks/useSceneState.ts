"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Scene, EditingPrompt } from "../types";
import { defaultScenes, TIMELINE_FLOAT_TOLERANCE } from "../constants";
import { buildInitialTimelineClips } from "../_utils";
import { usePreviewSceneMutation } from "./index";
import { useProject } from "./useProject";

export function useSceneState() {
  const { projectData, uiState, updateCache, updateUiCache } = useProject();
  
  const scenes = useMemo(() => {
    const rawScenes = projectData?.scenes || defaultScenes;
    return rawScenes.map((scene, index) => ({
      ...scene,
      id: scene.id ?? index + 1
    }));
  }, [projectData?.scenes]);
  const timelineClips = useMemo(() => {
    if (projectData?.scenes && projectData.scenes.length > 0) {
      return buildInitialTimelineClips(projectData.scenes);
    }
    return buildInitialTimelineClips(defaultScenes);
  }, [projectData?.scenes]);

  const [timelineCurrentTime, setTimelineCurrentTime] = useState(0);
  const [timelineIsPlaying, setTimelineIsPlaying] = useState(false);
  
  const sceneGenerating = useMemo(() => uiState.sceneGenerating, [uiState.sceneGenerating]);
  const editingImagePrompt = useMemo(() => uiState.editingImagePrompt, [uiState.editingImagePrompt]);
  const editingAudioPrompt = useMemo(() => uiState.editingAudioPrompt, [uiState.editingAudioPrompt]);
  
  const [isGeneratingAllImages, setIsGeneratingAllImages] = useState(false);
  const [isGeneratingAllAudios, setIsGeneratingAllAudios] = useState(false);

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
      const currentScenes = old.scenes || defaultScenes;
      const next = typeof newScenes === "function" ? newScenes(currentScenes) : newScenes;
      return { scenes: next };
    });
  }, [updateCache]);

  const updateScene = useCallback((sceneId: number, key: "image_prompt" | "speech" | "video_prompt", value: string) => {
    setScenes((prev) => prev.map((scene) => (scene.id === sceneId ? { ...scene, [key]: value } : scene)));
  }, [setScenes]);

  const handleGenerateSceneImage = useCallback(async (sceneId: number, image_prompt: string, main_ref?: string, secondary_ref?: string) => {
    updateUiCache((old) => {
      const sg = old.sceneGenerating || {};
      return { sceneGenerating: { ...sg, [sceneId]: { ...sg[sceneId], image: true } } };
    });
    try {
      const data = await previewSceneMutation.mutateAsync({ 
        type: "image", 
        image_prompt,
        main_reference: main_ref,
        secondary_reference: secondary_ref
      });
      setScenes((prev) =>
        prev.map((s) => (s.id === sceneId ? { ...s, image_url: data.image_url } : s))
      );
      updateUiCache((old) => {
        const ep = old.editingImagePrompt || {};
        return { editingImagePrompt: { ...ep, [sceneId]: false } };
      });
      return data;
    } finally {
      updateUiCache((old) => {
        const sg = old.sceneGenerating || {};
        return { sceneGenerating: { ...sg, [sceneId]: { ...sg[sceneId], image: false } } };
      });
    }
  }, [previewSceneMutation, setScenes, updateUiCache]);

  const handleGenerateSceneAudio = useCallback(async (sceneId: number, speech: string) => {
    updateUiCache((old) => {
      const sg = old.sceneGenerating || {};
      return { sceneGenerating: { ...sg, [sceneId]: { ...sg[sceneId], audio: true } } };
    });
    try {
      const data = await previewSceneMutation.mutateAsync({ type: "audio", speech });
      setScenes((prev) =>
        prev.map((s) => (s.id === sceneId ? { ...s, audio_url: data.audio_url, audio_duration: data.audio_duration } : s))
      );
      updateUiCache((old) => {
        const ep = old.editingAudioPrompt || {};
        return { editingAudioPrompt: { ...ep, [sceneId]: false } };
      });
    } finally {
      updateUiCache((old) => {
        const sg = old.sceneGenerating || {};
        return { sceneGenerating: { ...sg, [sceneId]: { ...sg[sceneId], audio: false } } };
      });
    }
  }, [previewSceneMutation, setScenes, updateUiCache]);

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

  const handleGenerateAllAudios = useCallback(async () => {
    setIsGeneratingAllAudios(true);
    try {
      const validScenes = scenes.filter((scene) => scene.speech?.trim());
      if (!validScenes.length) return;
      await Promise.all(
        validScenes.map((scene) => handleGenerateSceneAudio(scene.id, scene.speech))
      );
    } catch (error) {
      console.error("Bulk audio generation failed:", error);
    } finally {
      setIsGeneratingAllAudios(false);
    }
  }, [scenes, handleGenerateSceneAudio]);

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
    editingAudioPrompt,
    setEditingAudioPrompt: (val: EditingPrompt | ((prev: EditingPrompt) => EditingPrompt)) => {
      updateUiCache((old) => {
        const current = old.editingAudioPrompt || {};
        const next = typeof val === "function" ? val(current) : val;
        return { editingAudioPrompt: next };
      });
    },
    isGeneratingAllImages,
    isGeneratingAllAudios,
    timelineTotalDuration,
    activeTimelineClip,
    updateScene,
    handleGenerateSceneImage,
    handleGenerateSceneAudio,
    handleGenerateAllImages,
    handleGenerateAllAudios,
    handleTimelineClipsChange,
    handleTimelineTimeChange
  };
}
