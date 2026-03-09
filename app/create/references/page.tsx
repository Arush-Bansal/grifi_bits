"use client";

import { ReferenceStyleStep } from "../_components/reference-style-step";
import { StepNavigation } from "../_components/step-navigation";
import { useCreatePageContext } from "../_context/CreatePageContext";

export default function ReferencesPage() {
  const state = useCreatePageContext();

  return (
    <>
      <ReferenceStyleStep
        references={state.references}
        setReferences={state.setReferences}
        editingRefId={state.editingRefId}
        setEditingRefId={state.setEditingRefId}
        updateReferenceLimit={state.updateReferenceLimit}
        updateReferenceImage={state.updateReferenceImage}
        addReferenceCard={state.addReferenceCard}
        setIsAiAvatarLibraryOpen={state.setIsAiAvatarLibraryOpen}
      />
      <StepNavigation />
    </>
  );
}
