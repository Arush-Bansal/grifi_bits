"use client";

import { PlanSelectionStep } from "../_components/plan-selection-step";
import { StepNavigation } from "../_components/step-navigation";
import { useCreatePageContext } from "../_context/CreatePageContext";

export default function ConceptsPage() {
  const state = useCreatePageContext();

  return (
    <>
      <PlanSelectionStep
        plans={state.plans}
        selectedPlanIndex={state.selectedPlanIndex}
        setSelectedPlanIndex={state.setSelectedPlanIndex}
        settings={state.settings}
        setSettings={state.setSettings}
        onRefresh={() => state.generateConceptsMutation.mutate({ productName: state.productName, description: state.description })}
        isRefreshing={state.generateConceptsMutation.isPending}
      />
      <StepNavigation />
    </>
  );
}
