"use client";

import { PlanSelectionStep } from "../_components/plan-selection-step";
import { StepNavigation } from "../_components/step-navigation";
import { useAiPlan } from "../_hooks/useAiPlan";
import { useProductInfo } from "../_hooks/useProductInfo";
import { useCreateMutations } from "../_hooks/useCreateMutations";
import { useProject } from "../_hooks/useProject";
import { useSceneState } from "../_hooks/useSceneState";
import { useReferenceState } from "../_hooks/useReferenceState";
import { useUIState } from "../_hooks/useUIState";

export default function ConceptsPage() {
  const { plans, selected_plan_index, setSelectedPlanIndex, settings, setSettings } = useAiPlan();
  const { product_name, product_description, imageFiles } = useProductInfo();
  const sceneState = useSceneState();
  const referenceState = useReferenceState();
  const uiState = useUIState();
  const { projectData, saveProjectWithData } = useProject();

  const mutations = useCreateMutations({
    setPlans: () => {}, // Mocked as useAiPlan handles it via cache
    setSelectedPlanIndex,
    setStep: uiState.setStep,
    saveProjectWithData,
    imageFiles,
    syncState: projectData || {},
    setReferences: referenceState.setReferences,
    setScenes: sceneState.setScenes,
    setTimelineClips: sceneState.setTimelineClips,
    handleGenerateSceneImage: sceneState.handleGenerateSceneImage
  });

  return (
    <>
      <PlanSelectionStep
        plans={plans}
        selected_plan_index={selected_plan_index}
        setSelectedPlanIndex={setSelectedPlanIndex}
        settings={settings}
        setSettings={setSettings}
        onRefresh={() => mutations.generateConceptsMutation.mutate({ product_name, product_description })}
        isRefreshing={mutations.generateConceptsMutation.isPending}
      />
      <StepNavigation />
    </>
  );
}
