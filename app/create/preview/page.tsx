"use client";

import { FinalPreviewStep } from "../_components/final-preview-step";
import { StepNavigation } from "../_components/step-navigation";
import { useCreatePageContext } from "../_context/CreatePageContext";
import { TIMELINE_MIN_DURATION_SECONDS } from "../constants";
import { formatTimelineTime } from "../_utils";
import { Scene, ReferenceCard } from "../types";

export default function PreviewPage() {
  const state = useCreatePageContext();

  return (
    <>
      <FinalPreviewStep
        productName={state.productName}
        activeTimelineClip={state.activeTimelineClip}
        scenes={state.scenes}
        generateMediaLoading={state.generateMediaMutation.isPending}
        generateMedia={() => state.generateMediaMutation.mutate({
          scenes: state.scenes.map((s: Scene) => ({
            ...s,
            videoPrompt: s.videoScript
          })),
          references: Object.fromEntries(state.references.map((r: ReferenceCard) => [r.id, r.tagline])),
          voiceId: "pNInz6obpgmqS29pXv50" // Hardcoded voice ID as in original or via env
        })}
        captions={state.captions}
        setCaptions={state.setCaptions}
        music={state.music}
        setMusic={state.setMusic}
        timelineClips={state.timelineClips}
        timelineCurrentTime={state.timelineCurrentTime}
        timelineIsPlaying={state.timelineIsPlaying}
        TIMELINE_MIN_DURATION_SECONDS={TIMELINE_MIN_DURATION_SECONDS}
        handleTimelineTimeChange={state.handleTimelineTimeChange}
        setTimelineIsPlaying={state.setTimelineIsPlaying}
        handleTimelineClipsChange={state.handleTimelineClipsChange}
        saveProject={state.saveProject}
        saving={state.saving}
        formatTimelineTime={formatTimelineTime}
        timelineTotalDuration={state.timelineTotalDuration}
      />
      <StepNavigation />
    </>
  );
}
