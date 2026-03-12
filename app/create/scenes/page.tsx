"use client";

import { StepNavigation } from "../_components/step-navigation";
import { useProject } from "../_hooks/useProject";
import { useSceneState } from "../_hooks/useSceneState";
import { ScenesHeader } from "./_components/ScenesHeader";
import { ScenesTable } from "./_components/ScenesTable";

export default function ScenesPage() {
  const { projectId } = useProject();
  const {
    scenes,
  } = useSceneState();

  return (
    <>
      {projectId && (
        <div>
          <ScenesHeader />
          <ScenesTable
            projectId={projectId}
            scenes={scenes}
          />
        </div>
      )}
      <StepNavigation />
    </>
  );
}
