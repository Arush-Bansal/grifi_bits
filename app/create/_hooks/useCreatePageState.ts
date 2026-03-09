"use client";

import "@xzdarcy/react-timeline-editor/dist/react-timeline-editor.css";


// Hooks
import { useReferenceState } from "./useReferenceState";
import { useSceneState } from "./useSceneState";
import { useProductInfo } from "./useProductInfo";
import { useAiPlan } from "./useAiPlan";
import { useProjectSync } from "./useProjectSync";
import { useStepState } from "./useStepState";
import { useCreateMutations } from "./useCreateMutations";


export function useCreatePageState() {
  // Sub-hooks
  const productInfo = useProductInfo();
  const sceneState = useSceneState();
  const referenceState = useReferenceState();
  const aiPlan = useAiPlan();
  const { step, setStep, stepTitle } = useStepState();

  const syncState = {
    product_name: productInfo.product_name,
    product_description: productInfo.product_description,
    imageFiles: productInfo.imageFiles,
    scenes: sceneState.scenes,
    references: referenceState.references,
    plans: aiPlan.plans,
    selected_plan_index: aiPlan.selected_plan_index,
    settings: aiPlan.settings,
    previewUrls: productInfo.previewUrls
  };

  const setters = {
    setProductName: productInfo.setProductName,
    setDescription: productInfo.setDescription,
    setScenes: sceneState.setScenes,
    setPlans: aiPlan.setPlans,
    setSelectedPlanIndex: aiPlan.setSelectedPlanIndex,
    setSettings: aiPlan.setSettings,
    setTimelineClips: sceneState.setTimelineClips,
    setReferences: referenceState.setReferences,
    setPreviewUrls: productInfo.setPreviewUrls
  };

  const projectSync = useProjectSync(syncState, setters);

  const mutations = useCreateMutations({
    ...setters,
    setStep,
    saveProjectWithData: projectSync.saveProjectWithData,
    imageFiles: productInfo.imageFiles,
    syncState,
    handleGenerateSceneImage: sceneState.handleGenerateSceneImage
  });

  return {
    ...productInfo,
    ...sceneState,
    ...referenceState,
    ...aiPlan,
    ...projectSync,
    ...mutations,
    step, setStep,
    stepTitle
  };
}
