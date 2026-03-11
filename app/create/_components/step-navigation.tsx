"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProject } from "../_hooks/useProject";
import { useUIState } from "../_hooks/useUIState";
import { useProductInfo } from "../_hooks/useProductInfo";
import { useAiPlan } from "../_hooks/useAiPlan";
import { useCreateMutations } from "../_hooks/useCreateMutations";
import { useSceneState } from "../_hooks/useSceneState";
import { Step } from "../types";

const stepToRoute: Record<Step, string> = {
  0: "/create/setup",
  1: "/create/concepts",
  2: "/create/references",
  3: "/create/scenes",
  4: "/create/preview",
};

export function StepNavigation() {
  const router = useRouter();
  const { projectId, updateUiCache, projectData } = useProject();
  const { step, setStep } = useUIState();
  const { product_name, product_description, imageFiles, previewUrls } = useProductInfo();
  const { plans, selected_plan_index, settings, setSelectedPlanIndex, custom_concept } = useAiPlan();
  const sceneState = useSceneState();

  const mutations = useCreateMutations({
    setPlans: () => {}, // Handled via cache in useAiPlan
    setSelectedPlanIndex,
    setStep,
    imageFiles,
    setScenes: sceneState.setScenes,
    setTimelineClips: sceneState.setTimelineClips,
    handleGenerateSceneImage: sceneState.handleGenerateSceneImage,
  });

  const handleNavigate = (nextStep: number) => {
    const url = `${stepToRoute[nextStep as Step]}${projectId ? `?id=${projectId}` : ""}`;
    router.push(url);
  };

  return (
    <div className="mt-8 flex items-center justify-between gap-4">
      <Button 
        variant="outline" 
        onClick={() => handleNavigate(step - 1)} 
        disabled={step === 0}
      >
        Back
      </Button>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className={cn(
            (!projectId || (step !== 0 && step !== 1)) && "hidden",
            (step === 0 && (!plans || plans.length === 0)) && "hidden",
            (step === 1 && (!projectData?.scenes || projectData.scenes.length === 0)) && "hidden"
          )}
          onClick={() => handleNavigate(step + 1)}
          disabled={mutations.orchestrateMutation.isPending}
        >
          Next
        </Button>
        <Button
          onClick={() => {
            if (step === 0) {
              mutations.generateConceptsMutation.mutate({ 
                product_name, 
                product_description 
              });
            } else if (step === 1) {
              // Suspend auto-save before orchestration
              updateUiCache({ isAutoSaveSuspended: true });
              const isCustom = selected_plan_index === plans.length;
              const selected_plan_text = isCustom 
                ? `Custom Concept: ${custom_concept?.title || "Untitled"}\nDescription: ${custom_concept?.description || "No description provided."}`
                : plans[selected_plan_index]?.title;

              mutations.orchestrateMutation.mutate({
                product_name,
                product_description,
                image_contexts: previewUrls,
                selected_plan: selected_plan_text,
                settings,
                product_id: projectId || undefined
              });
            } else {
              handleNavigate(step + 1);
            }
          }}
          disabled={
            (step === 0 && (!product_name || !product_description || mutations.generateConceptsMutation.isPending)) || 
            (step === 1 && mutations.orchestrateMutation.isPending) ||
            step === 4
          }
        >
          {step === 0 ? (mutations.generateConceptsMutation.isPending ? "Generating Concepts..." : "Generate Concepts") : 
           step === 1 ? (mutations.orchestrateMutation.isPending ? "Building Plan..." : "Generate AI Plan") : 
           "Next"}
        </Button>
      </div>
    </div>
  );
}
