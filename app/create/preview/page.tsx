"use client";

import { useState } from "react";
import { FinalPreviewStep } from "../_components/final-preview-step";
import { StepNavigation } from "../_components/step-navigation";
import { useSceneState } from "../_hooks/useSceneState";
import { useAiPlan } from "../_hooks/useAiPlan";
import { useCreateMutations } from "../_hooks/useCreateMutations";
import { useProject } from "../_hooks/useProject";
import { useUIState } from "../_hooks/useUIState";
import { TIMELINE_MIN_DURATION_SECONDS } from "../constants";
import { formatTimelineTime } from "../_utils";
import { Scene, ReferenceCard } from "../types";

export default function PreviewPage() {
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
  const [references] = useState<ReferenceCard[]>([]);
  const { projectData, saveProjectWithData, saving } = useProject();
  const { setStep } = useUIState();

  const mutations = useCreateMutations({
    setPlans: () => {},
    setSelectedPlanIndex,
    setStep,
    imageFiles: [], // imageFiles not needed for media generation
    setScenes,
    setTimelineClips: () => {}, // timelineClips is derived
    handleGenerateSceneImage
  });

  return (
    <>
      <FinalPreviewStep
        activeTimelineClip={activeTimelineClip}
        scenes={scenes}
        generateMediaLoading={mutations.generateMediaMutation.isPending}
        generateMedia={() => mutations.generateMediaMutation.mutate({
          scenes: scenes.map((s: Scene) => ({
            ...s,
            video_prompt: s.video_prompt
          })),
          references: Object.fromEntries(references.map((r: ReferenceCard) => [r.id, r.tagline])),
          // voice_id is intentionally omitted here to let the backend use process.env.ELEVEN_LABS_VOICE_ID 
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
