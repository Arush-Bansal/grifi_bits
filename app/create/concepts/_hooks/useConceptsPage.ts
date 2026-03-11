"use client";

import { useAiPlan } from "../../_hooks/useAiPlan";
import { useProductInfo } from "../../_hooks/useProductInfo";
import { useCreateMutations } from "../../_hooks/useCreateMutations";
import { useSceneState } from "../../_hooks/useSceneState";
import { useUIState } from "../../_hooks/useUIState";

export function useConceptsPage() {
  const { 
    plans, 
    selected_plan_index, 
    setSelectedPlanIndex, 
    custom_concept, 
    setCustomConcept, 
    settings, 
    setSettings 
  } = useAiPlan();
  
  const { product_name, product_description, imageFiles } = useProductInfo();
  const { setScenes, setTimelineClips, handleGenerateSceneImage } = useSceneState();
  const { setStep } = useUIState();

  const mutations = useCreateMutations({
    setPlans: () => {}, 
    setSelectedPlanIndex,
    setStep,
    imageFiles,
    setScenes,
    setTimelineClips,
    handleGenerateSceneImage
  });

  const selectedPlan = plans[selected_plan_index];
  
  const onRefresh = () => {
    mutations.generateConceptsMutation.mutate({ 
      product_name, 
      product_description 
    });
  };

  const isRefreshing = mutations.generateConceptsMutation.isPending;

  return {
    plans,
    selected_plan_index,
    setSelectedPlanIndex,
    custom_concept,
    setCustomConcept,
    settings,
    setSettings,
    selectedPlan,
    onRefresh,
    isRefreshing
  };
}
