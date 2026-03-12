"use client";

import { useSceneState } from "../../_hooks/useSceneState";
import { useAiPlan } from "../../_hooks/useAiPlan";
import { useCreateMutations } from "../../_hooks/useCreateMutations";
import { useProject } from "../../_hooks/useProject";
import { useUIState } from "../../_hooks/useUIState";
import { Scene, ReferenceCard } from "../../types";
import { usePreviewAudio } from "./usePreviewAudio";

export function usePreviewPage() {
  const {
    scenes,
    activeTimelineClip,
    timelineClips,
    timelineCurrentTime,
    timelineIsPlaying,
    handleTimelineTimeChange,
    setTimelineIsPlaying,
    handleTimelineClipsChange,
    timelineTotalDuration,
    setScenes,
    handleGenerateSceneImage,
  } = useSceneState();
  
  const { settings, setSettings, setSelectedPlanIndex } = useAiPlan();
  const { projectData, saveProjectWithData, saving } = useProject();
  const { setStep } = useUIState();

  const mutations = useCreateMutations({
    setPlans: () => {},
    setSelectedPlanIndex,
    setStep,
    imageFiles: [],
    setScenes,
    setTimelineClips: () => {},
    handleGenerateSceneImage,
  });

  const { audioRef, bgAudioRef } = usePreviewAudio({
    timelineIsPlaying,
    timelineCurrentTime,
    activeTimelineClip,
    scenes,
    settings,
  });

  const renderVideo = () =>
    mutations.remotionRenderMutation.mutate({
      productDemoData: {
        scenes,
        productName: projectData?.product_name || "Product",
        brandColor: "#f97316",
      },
    });

  const onGenerateMedia = () =>
    mutations.generateMediaMutation.mutate({
      scenes: scenes.map((s: Scene) => ({
        ...s,
        video_prompt: s.video_prompt,
      })),
      references: Object.fromEntries(
        (projectData?.references || []).map((r: ReferenceCard) => [r.id, r.image_url])
      ),
    });

  return {
    // State
    scenes,
    activeTimelineClip,
    timelineClips,
    timelineCurrentTime,
    timelineIsPlaying,
    timelineTotalDuration,
    settings,
    projectData,
    saving,
    isGenerating: mutations.generateMediaMutation.isPending || mutations.remotionRenderMutation.isPending,
    
    // Refs
    audioRef,
    bgAudioRef,
    
    // Handlers
    setSettings,
    handleTimelineTimeChange,
    setTimelineIsPlaying,
    handleTimelineClipsChange,
    onSaveProject: () => projectData && saveProjectWithData(projectData),
    onGenerateMedia,
    onRenderVideo: renderVideo,
  };
}
