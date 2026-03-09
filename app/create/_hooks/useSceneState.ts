"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { StoryboardTimelineClip } from "@/components/timeline/storyboard-timeline";
import { Scene, SceneGenerating, EditingPrompt } from "../types";
import { defaultScenes, TIMELINE_FLOAT_TOLERANCE } from "../constants";
import { buildInitialTimelineClips, normalizeTimelineClips } from "../_utils";
import { usePreviewSceneMutation } from "./index";

export function useSceneState() {
  const [scenes, setScenes] = useState<Scene[]>(defaultScenes);
  const [timelineClips, setTimelineClips] = useState<StoryboardTimelineClip[]>(() => buildInitialTimelineClips(defaultScenes));
  const [timelineCurrentTime, setTimelineCurrentTime] = useState(0);
  const [timelineIsPlaying, setTimelineIsPlaying] = useState(false);
  const [sceneGenerating, setSceneGenerating] = useState<SceneGenerating>({});
  const [editingImagePrompt, setEditingImagePrompt] = useState<EditingPrompt>({});
  const [editingAudioPrompt, setEditingAudioPrompt] = useState<EditingPrompt>({});
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

  const updateScene = useCallback((sceneId: number, key: "imagePrompt" | "audioPrompt" | "videoScript", value: string) => {
    setScenes((prev) => prev.map((scene) => (scene.id === sceneId ? { ...scene, [key]: value } : scene)));
  }, []);

  const handleGenerateSceneImage = useCallback(async (sceneId: number, imagePrompt: string, mainRef?: string, secondaryRef?: string) => {
    setSceneGenerating((prev) => ({ ...prev, [sceneId]: { ...prev[sceneId], image: true } }));
    try {
      const data = await previewSceneMutation.mutateAsync({ 
        type: "image", 
        imagePrompt,
        mainReference: mainRef,
        secondaryReference: secondaryRef
      });
      setScenes((prev) =>
        prev.map((s) => (s.id === sceneId ? { ...s, imageUrl: data.imageUrl } : s))
      );
      setEditingImagePrompt((prev) => ({ ...prev, [sceneId]: false }));
      return data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      const message = axiosError.response?.data?.error || (error as Error).message || "Image generation failed.";
      alert(message);
    } finally {
      setSceneGenerating((prev) => ({ ...prev, [sceneId]: { ...prev[sceneId], image: false } }));
    }
  }, [previewSceneMutation]);

  const handleGenerateSceneAudio = useCallback(async (sceneId: number, audioScript: string) => {
    setSceneGenerating((prev) => ({ ...prev, [sceneId]: { ...prev[sceneId], audio: true } }));
    try {
      const data = await previewSceneMutation.mutateAsync({ type: "audio", audioScript });
      setScenes((prev) =>
        prev.map((s) => (s.id === sceneId ? { ...s, audioUrl: data.audioUrl, audioDuration: data.audioDuration } : s))
      );
      if (data.audioDuration) {
        const audioDuration = data.audioDuration;
        setTimelineClips((prev) => 
          normalizeTimelineClips(
            prev.map((clip: StoryboardTimelineClip) => 
              clip.sceneId === sceneId 
                ? { ...clip, end: clip.start + audioDuration } 
                : clip
            )
          )
        );
      }
      setEditingAudioPrompt((prev) => ({ ...prev, [sceneId]: false }));
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      const message = axiosError.response?.data?.error || (error as Error).message || "Audio generation failed.";
      alert(message);
    } finally {
      setSceneGenerating((prev) => ({ ...prev, [sceneId]: { ...prev[sceneId], audio: false } }));
    }
  }, [previewSceneMutation]);

  const handleGenerateAllImages = useCallback(async () => {
    setIsGeneratingAllImages(true);
    try {
      await Promise.all(
        scenes.map((scene: Scene) =>
          handleGenerateSceneImage(
            scene.id,
            scene.imagePrompt,
            scene.mainReference,
            scene.secondaryReference
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
      await Promise.all(
        scenes.map((scene) => handleGenerateSceneAudio(scene.id, scene.audioPrompt))
      );
    } catch (error) {
      console.error("Bulk audio generation failed:", error);
    } finally {
      setIsGeneratingAllAudios(false);
    }
  }, [scenes, handleGenerateSceneAudio]);

  const handleTimelineClipsChange = useCallback((nextClips: StoryboardTimelineClip[]) => {
    setTimelineClips(normalizeTimelineClips(nextClips));
  }, []);

  const handleTimelineTimeChange = useCallback((nextTime: number) => {
    const bounded = Number(Math.max(0, Math.min(nextTime, timelineTotalDuration)).toFixed(2));
    setTimelineCurrentTime(bounded);
  }, [timelineTotalDuration]);

  return {
    scenes,
    setScenes,
    timelineClips,
    setTimelineClips,
    timelineCurrentTime,
    setTimelineCurrentTime,
    timelineIsPlaying,
    setTimelineIsPlaying,
    sceneGenerating,
    editingImagePrompt,
    setEditingImagePrompt,
    editingAudioPrompt,
    setEditingAudioPrompt,
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
