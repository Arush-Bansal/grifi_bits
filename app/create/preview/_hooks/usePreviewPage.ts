"use client";

import { useSceneState } from "../../_hooks/useSceneState";
import { useAiPlan } from "../../_hooks/useAiPlan";
import { useCreateMutations } from "../../_hooks/useCreateMutations";
import { useProject } from "../../_hooks/useProject";
import { useUIState } from "../../_hooks/useUIState";

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
  } = useSceneState();
  
  const { settings, setSettings } = useAiPlan();
  const { projectData, saveProjectWithData, saving } = useProject();
  const { setStep } = useUIState();

  const mutations = useCreateMutations({
    setStep,
    setScenes,
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
        brandColor: settings?.brand_color || "#f97316",
        templateId:
          settings?.template_id ||
          (settings?.template_preference && settings.template_preference !== "auto"
            ? settings.template_preference
            : undefined),
      },
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
    finalVideoUrl: projectData?.settings?.final_video_url,
    saving,
    isGenerating: mutations.remotionRenderMutation.isPending,
    
    // Refs
    audioRef,
    bgAudioRef,
    
    // Handlers
    setSettings,
    handleTimelineTimeChange,
    setTimelineIsPlaying,
    handleTimelineClipsChange,
    onSaveProject: () => projectData && saveProjectWithData(projectData),
    onRenderVideo: renderVideo,
  };
}
