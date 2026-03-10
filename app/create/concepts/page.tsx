"use client";

import { PlanSelectionStep } from "../_components/plan-selection-step";
import { StepNavigation } from "../_components/step-navigation";
import { useAiPlan } from "../_hooks/useAiPlan";
import { useProductInfo } from "../_hooks/useProductInfo";
import { useCreateMutations } from "../_hooks/useCreateMutations";
import { useSceneState } from "../_hooks/useSceneState";
import { useReferenceState } from "../_hooks/useReferenceState";
import { useUIState } from "../_hooks/useUIState";

export default function ConceptsPage() {
  const { plans, selected_plan_index, setSelectedPlanIndex, custom_concept, setCustomConcept, settings, setSettings } = useAiPlan();
  const { product_name, product_description, imageFiles } = useProductInfo();
  const { setScenes, setTimelineClips, handleGenerateSceneImage } = useSceneState();
  const { setReferences } = useReferenceState();
  const { setStep } = useUIState();

  const mutations = useCreateMutations({
    setPlans: () => {}, // Mocked as useAiPlan handles it via cache
    setSelectedPlanIndex,
    setStep,
    imageFiles,
    setReferences,
    setScenes,
    setTimelineClips,
    handleGenerateSceneImage
  });

  return (
    <>
      <PlanSelectionStep
        plans={plans}
        selected_plan_index={selected_plan_index}
        setSelectedPlanIndex={setSelectedPlanIndex}
        custom_concept={custom_concept}
        setCustomConcept={setCustomConcept}
        settings={settings}
        setSettings={setSettings}
        onRefresh={() => mutations.generateConceptsMutation.mutate({ product_name, product_description })}
        isRefreshing={mutations.generateConceptsMutation.isPending}
      />
      <StepNavigation />
    </>
  );
}
