"use client";

import { QueryClient } from "@tanstack/react-query";
import { Scene, Step, ProjectData, PlanConcept, ReferenceCard, ProjectUiState } from "../types";
import { normalizeTimelineClips } from "../_utils";
import { type StoryboardTimelineClip } from "@/components/timeline/storyboard-timeline";
import {
  useGenerateConceptsMutation,
  useOrchestrateMutation,
  useGenerateMediaMutation
} from "./index";

interface MutationDeps {
  setPlans: (plans: PlanConcept[]) => void;
  setSelectedPlanIndex: (index: number) => void;
  setStep: (step: Step) => void;
  saveProjectWithData: (data: ProjectData) => Promise<void>;
  imageFiles: File[];
  syncState: Partial<ProjectData>;
  setReferences: (refs: ReferenceCard[] | ((prev: ReferenceCard[]) => ReferenceCard[])) => void;
  setScenes: (scenes: Scene[] | ((prev: Scene[]) => Scene[])) => void;
  setTimelineClips: (clips: StoryboardTimelineClip[] | ((prev: StoryboardTimelineClip[]) => StoryboardTimelineClip[])) => void;
  handleGenerateSceneImage: (sceneId: number, prompt: string, main_ref?: string, secondary_ref?: string, options?: { referenceId?: string }) => Promise<any>;
  queryClient: QueryClient;
  updateUiCache: (updater: Partial<ProjectUiState> | ((old: ProjectUiState) => Partial<ProjectUiState>)) => void;
}

export function useCreateMutations(deps: MutationDeps) {
  const {
    setPlans,
    setSelectedPlanIndex,
    setStep,
    saveProjectWithData,
    imageFiles,
    syncState,
    setReferences,
    setScenes,
        setTimelineClips,
    handleGenerateSceneImage,
    queryClient,
    updateUiCache
  } = deps;

  const generateConceptsMutation = useGenerateConceptsMutation({
    onSuccess: (data) => {
      setPlans(data.concepts);
      setSelectedPlanIndex(0);
      setStep(1);
      saveProjectWithData({
        ...syncState,
        product_name: syncState.product_name || "Untitled Project",
        image_names: imageFiles.map((f: File) => f.name),
        selected_reference: null,
        plans: data.concepts,
        selected_plan_index: 0
      });
    }
  });

  const orchestrateMutation = useOrchestrateMutation({
    onSuccess: async (data: ProjectData) => {
      // 1. Ensure auto-save is suspended (though it should already be from step-navigation)
      updateUiCache({ isAutoSaveSuspended: true });

      // 2. Update cache IN ONE GO with the authoritative data from orchestration
      if (data.id) {
        queryClient.setQueryData(["project", data.id], data);
      }

      // 3. Move to Step 3
      setStep(2);

      // 4. Trigger image generation for references if they are placeholders
      const references = data.references || [];
      const generationPromises = references.map(async (ref) => {
        if (ref.ai_prompt && (ref.image_url?.includes("Generating") || !ref.image_url || ref.image_url.includes("placeholder"))) {
          try {
            const imgData = await handleGenerateSceneImage(0, ref.ai_prompt, undefined, undefined, { referenceId: ref.id });
            if (imgData && imgData.image_url) {
                const image_url = imgData.image_url;
                setReferences((prev: ReferenceCard[]) => prev.map(r => r.id === ref.id ? { ...r, image_url: image_url } : r));
            }
          } catch (error) {
            console.error(`Failed to generate image for ${ref.id}:`, error);
          }
        }
      });

      // 5. Resume auto-save once primary state is settled
      await Promise.all(generationPromises);
      updateUiCache({ isAutoSaveSuspended: false });
    },
    onError: () => {
      updateUiCache({ isAutoSaveSuspended: false });
    }
  });

  const generateMediaMutation = useGenerateMediaMutation({
    successMessage: "Media generation complete!",
    onSuccess: (data: { scene_results: Partial<Scene>[] }) => {
      setScenes((prev: Scene[]) => prev.map((scene: Scene) => {
        const result = data.scene_results.find((r) => r.id === scene.id);
        if (result) {
          return {
            ...scene,
            ...result
          };
        }
        return scene;
      }));

      setTimelineClips((prev: StoryboardTimelineClip[]) => {
        const nextClips = prev.map((clip: StoryboardTimelineClip) => {
          const result = data.scene_results.find(r => r.id === clip.sceneId);
          if (result && result.audio_duration) {
            return { ...clip, end: clip.start + result.audio_duration };
          }
          return clip;
        });
        return normalizeTimelineClips(nextClips);
      });
    }
  });

  return {
    generateConceptsMutation,
    orchestrateMutation,
    generateMediaMutation
  };
}
