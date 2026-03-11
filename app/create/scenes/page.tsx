"use client";

import { StepNavigation } from "../_components/step-navigation";
import { useProject } from "../_hooks/useProject";
import { useSceneState } from "../_hooks/useSceneState";
import { useReferenceState } from "../_hooks/useReferenceState";
import { ScenesHeader } from "./_components/ScenesHeader";
import { ScenesTable } from "./_components/ScenesTable";

export default function ScenesPage() {
  const { projectId } = useProject();
  const {
    scenes,
    handleGenerateAllImages,
    handleGenerateAllAudios,
    isGeneratingAllImages,
    isGeneratingAllAudios,
  } = useSceneState();

  const { references } = useReferenceState();

  return (
    <>
      {projectId && (
        <div>
          <ScenesHeader
            onGenerateAllImages={handleGenerateAllImages}
            onGenerateAllAudios={handleGenerateAllAudios}
            isGeneratingAllImages={isGeneratingAllImages}
            isGeneratingAllAudios={isGeneratingAllAudios}
          />
          <ScenesTable
            projectId={projectId}
            scenes={scenes}
            references={references}
          />
        </div>
      )}
      <StepNavigation />
    </>
  );
}
