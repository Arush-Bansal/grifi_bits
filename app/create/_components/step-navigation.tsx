"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useProject } from "../_hooks/useProject";
import { useUIState } from "../_hooks/useUIState";
import { useProductInfo } from "../_hooks/useProductInfo";
import { useAiPlan } from "../_hooks/useAiPlan";
import { useCreateMutations } from "../_hooks/useCreateMutations";
import { useSceneState } from "../_hooks/useSceneState";
import { Step } from "../types";

const stepToRoute: Record<number, string> = {
  0: "/create/setup",
  1: "/create/settings",
  2: "/create/preview",
};

export function StepNavigation() {
  const router = useRouter();
  const { projectId, updateUiCache } = useProject();
  const { step, setStep } = useUIState();
  const { product_name, product_description, previewUrls } = useProductInfo();
  const { settings } = useAiPlan();
  const sceneState = useSceneState();

  const mutations = useCreateMutations({
    setStep,
    setScenes: sceneState.setScenes,
  });

  const handleNavigate = (nextStep: number) => {
    const url = `${stepToRoute[nextStep as Step]}${projectId ? `?id=${projectId}` : ""}`;
    router.push(url);
  };

  return (
    <div className="mt-12 flex items-center justify-between gap-6">
      <Button 
        variant="ghost" 
        onClick={() => handleNavigate(step - 1)} 
        disabled={step === 0}
        className="h-12 px-8 font-bold text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground active:scale-95 disabled:opacity-0"
      >
        Back
      </Button>
      
      <div className="flex items-center gap-4">
        <Button
          size="lg"
          className="group relative h-14 min-w-[200px] overflow-hidden rounded-full font-black tracking-tight shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:scale-100"
          onClick={() => {
            if (step === 1) {
              updateUiCache({ isAutoSaveSuspended: true });
              mutations.orchestrateMutation.mutate({
                product_name,
                product_description,
                image_contexts: previewUrls,
                settings,
                product_id: projectId || undefined
              });
            } else {
              handleNavigate(step + 1);
            }
          }}
          disabled={
            (step === 0 && (!product_name || !product_description)) ||
            (step === 1 && mutations.orchestrateMutation.isPending) ||
            step === 2
          }
        >
          <div className="relative z-10 flex items-center gap-2">
            {step === 1 ? (
              mutations.orchestrateMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Curating Concept...</span>
                </>
              ) : (
                <>
                  <span>Generate Video</span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <svg className="h-3 w-3 fill-white" viewBox="0 0 24 24"><path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"/></svg>
                  </div>
                </>
              )
            ) : "Next Step"}
          </div>
          <div className="absolute inset-0 -z-0 bg-gradient-to-r from-primary to-blue-400 opacity-100 transition-opacity group-hover:from-blue-500 group-hover:to-primary" />
        </Button>
      </div>
    </div>
  );
}
