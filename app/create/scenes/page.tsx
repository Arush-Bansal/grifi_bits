"use client";

import { ScenesStep } from "../_components/scenes-step";
import { StepNavigation } from "../_components/step-navigation";
import { useCreatePageContext } from "../_context/CreatePageContext";

export default function ScenesPage() {
  const state = useCreatePageContext();

  return (
    <>
      <ScenesStep
        scenes={state.scenes}
        setScenes={state.setScenes}
        updateScene={state.updateScene}
        sceneGenerating={state.sceneGenerating}
        editingImagePrompt={state.editingImagePrompt}
        setEditingImagePrompt={state.setEditingImagePrompt}
        editingAudioPrompt={state.editingAudioPrompt}
        setEditingAudioPrompt={state.setEditingAudioPrompt}
        handleGenerateSceneImage={state.handleGenerateSceneImage}
        handleGenerateSceneAudio={state.handleGenerateSceneAudio}
        handleGenerateAllImages={state.handleGenerateAllImages}
        handleGenerateAllAudios={state.handleGenerateAllAudios}
        isGeneratingAllImages={state.isGeneratingAllImages}
        isGeneratingAllAudios={state.isGeneratingAllAudios}
        setLightboxImage={state.setLightboxImage}
        references={state.references}
      />
      <StepNavigation />
    </>
  );
}
