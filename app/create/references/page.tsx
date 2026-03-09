"use client";

import { ReferenceStyleStep } from "../_components/reference-style-step";
import { StepNavigation } from "../_components/step-navigation";
import { useProject } from "../_hooks/useProject";

export default function ReferencesPage() {
  const { projectId } = useProject();

  return (
    <>
      {projectId && <ReferenceStyleStep projectId={projectId} />}
      <StepNavigation />
    </>
  );
}
