"use client";

import { ScenesStep } from "../_components/scenes-step";
import { StepNavigation } from "../_components/step-navigation";
import { useProject } from "../_hooks/useProject";

export default function ScenesPage() {
  const { projectId } = useProject();

  return (
    <>
      {projectId && <ScenesStep projectId={projectId} />}
      <StepNavigation />
    </>
  );
}
