"use client";

import { useState } from "react";
import { StepNavigation } from "../_components/step-navigation";
import { useSceneState } from "../_hooks/useSceneState";
import { useAiPlan } from "../_hooks/useAiPlan";
import { useCreateMutations } from "../_hooks/useCreateMutations";
import { useProject } from "../_hooks/useProject";
import { useUIState } from "../_hooks/useUIState";
import { Scene, ReferenceCard } from "../types";
import { usePreviewAudio } from "./_hooks/usePreviewAudio";
import { VideoPreview } from "./_components/video-preview";
import { FinalControls } from "./_components/FinalControls";

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
    handleGenerateSceneImage,
  } = useSceneState();
  const { settings, setSettings, setSelectedPlanIndex } = useAiPlan();
  const [references] = useState<ReferenceCard[]>([]);
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

  const generateMedia = () =>
    mutations.generateMediaMutation.mutate({
      scenes: scenes.map((s: Scene) => ({
        ...s,
        video_prompt: s.video_prompt,
      })),
      references: Object.fromEntries(references.map((r: ReferenceCard) => [r.id, r.tagline])),
    });

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(280px,420px)_1fr]">
        <VideoPreview
          activeTimelineClip={activeTimelineClip}
          scenes={scenes}
          audioRef={audioRef}
          bgAudioRef={bgAudioRef}
          isPending={mutations.generateMediaMutation.isPending}
          onGenerateMedia={generateMedia}
          timelineCurrentTime={timelineCurrentTime}
          timelineTotalDuration={timelineTotalDuration}
          captionsEnabled={settings.captions_enabled}
        />

        <FinalControls
          settings={settings}
          setSettings={setSettings}
          timelineClips={timelineClips}
          timelineCurrentTime={timelineCurrentTime}
          timelineIsPlaying={timelineIsPlaying}
          onTimelineTimeChange={handleTimelineTimeChange}
          onTimelineIsPlayingChange={setTimelineIsPlaying}
          onTimelineClipsChange={handleTimelineClipsChange}
          onSaveProject={() => saveProjectWithData(projectData!)}
          isSaving={saving}
        />
      </div>
      <StepNavigation />
    </>
  );
}
