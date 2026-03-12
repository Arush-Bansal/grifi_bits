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

const stepToRoute: Record<number, string> = {
  0: "/create/setup",
  1: "/create/scenes",
  2: "/create/preview",
};

export function StepNavigation() {
  const router = useRouter();
  const { projectId, updateUiCache, projectData } = useProject();
  const { step, setStep } = useUIState();
  const { product_name, product_description, imageFiles, previewUrls } = useProductInfo();
  const { settings, setSelectedPlanIndex } = useAiPlan();
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
            (!projectId || step !== 0) && "hidden",
            (step === 0 && (!projectData?.scenes || projectData.scenes.length === 0)) && "hidden"
          )}
          onClick={() => handleNavigate(step + 1)}
          disabled={mutations.orchestrateMutation.isPending}
        >
          Next
        </Button>
        <Button
          onClick={() => {
            if (step === 0) {
              // Directly orchestrate with a default concept
              updateUiCache({ isAutoSaveSuspended: true });
              
              const defaultConcept = "Standard Product Demo";
              const defaultDescription = "Highlight the product features, benefits, and local availability in a professional and energetic way.";

              mutations.orchestrateMutation.mutate({
                product_name,
                product_description,
                image_contexts: previewUrls,
                selected_plan: `${defaultConcept}: ${defaultDescription}`,
                settings,
                product_id: projectId || undefined
              });
            } else {
              handleNavigate(step + 1);
            }
          }}
          disabled={
            (step === 0 && (!product_name || !product_description || mutations.orchestrateMutation.isPending)) || 
            step === 2
          }
        >
          {step === 0 ? (mutations.orchestrateMutation.isPending ? "Generating Scenes..." : "Generate Scenes") : "Next"}
        </Button>
      </div>
    </div>
  );
}
