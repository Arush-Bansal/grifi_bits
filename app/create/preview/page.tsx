"use client";

import { StepNavigation } from "../_components/step-navigation";
import { usePreviewPage } from "./_hooks/usePreviewPage";
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
    settings,
    saving,
    isGenerating,
    audioRef,
    bgAudioRef,
    setSettings,
    onSaveProject,
    onGenerateMedia,
  } = usePreviewPage();

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(280px,420px)_1fr]">
        <VideoPreview
          activeTimelineClip={activeTimelineClip}
          scenes={scenes}
          audioRef={audioRef}
          bgAudioRef={bgAudioRef}
          isPending={isGenerating}
          onGenerateMedia={onGenerateMedia}
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
          onSaveProject={onSaveProject}
          isSaving={saving}
        />
      </div>
      <StepNavigation />
    </>
  );
}
