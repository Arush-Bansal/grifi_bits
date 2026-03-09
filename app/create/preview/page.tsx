"use client";

import { FinalPreviewStep } from "../_components/final-preview-step";
import { StepNavigation } from "../_components/step-navigation";
import { useProductInfo } from "../_hooks/useProductInfo";
import { useSceneState } from "../_hooks/useSceneState";
import { useAiPlan } from "../_hooks/useAiPlan";
import { useCreateMutations } from "../_hooks/useCreateMutations";
import { useProject } from "../_hooks/useProject";
import { useReferenceState } from "../_hooks/useReferenceState";
import { useUIState } from "../_hooks/useUIState";
import { TIMELINE_MIN_DURATION_SECONDS } from "../constants";
import { formatTimelineTime } from "../_utils";
import { Scene, ReferenceCard } from "../types";

export default function PreviewPage() {
  const { product_name } = useProductInfo();
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
    handleGenerateSceneImage
  } = useSceneState();
  const { settings, setSettings, setSelectedPlanIndex } = useAiPlan();
  const { references, setReferences } = useReferenceState();
  const { projectData, saveProjectWithData, saving } = useProject();
  const { setStep } = useUIState();

  const mutations = useCreateMutations({
    setPlans: () => {},
    setSelectedPlanIndex,
    setStep,
    saveProjectWithData,
    imageFiles: [], // imageFiles not needed for media generation
    syncState: projectData || {},
    setReferences,
    setScenes,
    setTimelineClips: () => {}, // timelineClips is derived
    handleGenerateSceneImage
  });

  return (
    <>
      <FinalPreviewStep
        productName={product_name}
        activeTimelineClip={activeTimelineClip}
        scenes={scenes}
        generateMediaLoading={mutations.generateMediaMutation.isPending}
        generateMedia={() => mutations.generateMediaMutation.mutate({
          scenes: scenes.map((s: Scene) => ({
            ...s,
            video_prompt: s.video_prompt
          })),
          references: Object.fromEntries(references.map((r: ReferenceCard) => [r.id, r.tagline])),
          voice_id: "pNInz6obpgmqS29pXv50" // Hardcoded voice ID as in original or via env
        })}
        settings={settings}
        setSettings={setSettings}
        timelineClips={timelineClips}
        timelineCurrentTime={timelineCurrentTime}
        timelineIsPlaying={timelineIsPlaying}
        TIMELINE_MIN_DURATION_SECONDS={TIMELINE_MIN_DURATION_SECONDS}
        handleTimelineTimeChange={handleTimelineTimeChange}
        setTimelineIsPlaying={setTimelineIsPlaying}
        handleTimelineClipsChange={handleTimelineClipsChange}
        saveProject={() => saveProjectWithData(projectData!)}
        saving={saving}
        formatTimelineTime={formatTimelineTime}
        timelineTotalDuration={timelineTotalDuration}
      />
      <StepNavigation />
    </>
  );
}
