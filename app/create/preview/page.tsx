"use client";

import { StepNavigation } from "../_components/step-navigation";
import { usePreviewPage } from "./_hooks/usePreviewPage";
import { VideoPreview } from "./_components/video-preview";
import { FinalControls } from "./_components/FinalControls";

export default function PreviewPage() {
  const {
    scenes,
    settings,
    projectData,
    saving,
    isGenerating,
    audioRef,
    bgAudioRef,
    setSettings,
    onSaveProject,
    onRenderVideo,
  } = usePreviewPage();

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(280px,420px)_1fr]">
        <VideoPreview
          scenes={scenes}
          audioRef={audioRef}
          bgAudioRef={bgAudioRef}
          isPending={isGenerating}
          onRenderVideo={onRenderVideo}
          settings={settings}
          productName={projectData?.product_name}
        />

        <FinalControls
          settings={settings}
          setSettings={setSettings}
          onSaveProject={onSaveProject}
          isSaving={saving}
        />
      </div>
      <StepNavigation />
    </>
  );
}
