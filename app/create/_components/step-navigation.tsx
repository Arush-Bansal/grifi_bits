"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCreatePageContext } from "../_context/CreatePageContext";
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
  const state = useCreatePageContext();

  const handleNavigate = (nextStep: number) => {
    const projectId = state.projectId;
    const url = `${stepToRoute[nextStep as Step]}${projectId ? `?id=${projectId}` : ""}`;
    router.push(url);
  };

  return (
    <div className="mt-8 flex items-center justify-between gap-4">
      <Button 
        variant="outline" 
        onClick={() => handleNavigate(state.step - 1)} 
        disabled={state.step === 0}
      >
        Back
      </Button>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className={cn((!state.projectId || (state.step !== 0 && state.step !== 1)) && "hidden")}
          onClick={() => handleNavigate(state.step + 1)}
          disabled={state.orchestrateMutation.isPending}
        >
          Next
        </Button>
        <Button
          onClick={() => {
            if (state.step === 0) {
              state.generateConceptsMutation.mutate({ 
                productName: state.productName, 
                description: state.description 
              });
            } else if (state.step === 1) {
              state.orchestrateMutation.mutate({
                productName: state.productName,
                description: state.description,
                imageNames: state.imageFiles.length > 0 
                  ? state.imageFiles.map((f: File) => f.name) 
                  : state.previewUrls.map((p: { name: string; url: string }) => p.name),
                selectedPlan: state.plans[state.selectedPlanIndex]?.title,
                settings: state.settings
              });
            } else {
              handleNavigate(state.step + 1);
            }
          }}
          disabled={
            (state.step === 0 && (!state.productName || !state.description || state.generateConceptsMutation.isPending)) || 
            (state.step === 1 && state.orchestrateMutation.isPending) ||
            state.step === 4
          }
        >
          {state.step === 0 ? (state.generateConceptsMutation.isPending ? "Generating Concepts..." : "Generate Concepts") : 
           state.step === 1 ? (state.orchestrateMutation.isPending ? "Building Plan..." : "Generate AI Plan") : 
           "Next"}
        </Button>
      </div>
    </div>
  );
}
