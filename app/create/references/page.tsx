"use client";

import { StepNavigation } from "../_components/step-navigation";
import { useReferenceState } from "../_hooks/useReferenceState";
import { useUIState } from "../_hooks/useUIState";
import { useProject } from "../_hooks/useProject";
import { ReferenceHeader } from "./_components/ReferenceHeader";
import { ReferenceGrid } from "./_components/ReferenceGrid";

export default function ReferencesPage() {
  const { projectId } = useProject();
  const { references, addReferenceCard } = useReferenceState();
  const { setIsAiAvatarLibraryOpen } = useUIState();

  return (
    <>
      {projectId && (
        <div>
          <ReferenceHeader />
          <ReferenceGrid
            projectId={projectId}
            references={references}
            onAddReference={addReferenceCard}
            onOpenAiLibrary={() => setIsAiAvatarLibraryOpen(true)}
          />
        </div>
      )}
      <StepNavigation />
    </>
  );
}
