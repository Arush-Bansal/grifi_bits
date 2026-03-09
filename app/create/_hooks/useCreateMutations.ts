"use client";

import { OrchestrationResult, Scene, Step, ProjectData, PlanConcept, ReferenceCard } from "../types";
import { buildInitialTimelineClips, normalizeTimelineClips } from "../_utils";
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
  syncState: any; // Keep this as any for now as it's a complex union
  setReferences: (refs: ReferenceCard[] | ((prev: ReferenceCard[]) => ReferenceCard[])) => void;
  setScenes: (scenes: Scene[] | ((prev: Scene[]) => Scene[])) => void;
  setTimelineClips: (clips: StoryboardTimelineClip[] | ((prev: StoryboardTimelineClip[]) => StoryboardTimelineClip[])) => void;
  handleGenerateSceneImage: (sceneId: number, prompt: string) => Promise<any>;
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
    handleGenerateSceneImage
  } = deps;

  const generateConceptsMutation = useGenerateConceptsMutation({
    onSuccess: (data) => {
      setPlans(data.concepts);
      setSelectedPlanIndex(0);
      setStep(1);
      saveProjectWithData({
        ...syncState,
        image_names: imageFiles.map((f: File) => f.name),
        selected_reference: null,
        plans: data.concepts,
        selected_plan_index: 0
      });
    },
    onError: (error: Error) => {
      const axiosError = error as { response?: { data?: { error?: string } } };
      alert(axiosError.response?.data?.error || "Failed to generate concepts.");
    }
  });

  const orchestrateMutation = useOrchestrateMutation({
    onSuccess: async (data: OrchestrationResult) => {
      setReferences(data.references);
      setScenes(data.scenes);
      setTimelineClips(buildInitialTimelineClips(data.scenes));
      setStep(2);

      data.references.forEach(async (ref) => {
        if (ref.aiPrompt && ref.image.includes("Generating")) {
          try {
            const imgData = await handleGenerateSceneImage(0, ref.aiPrompt);
            if (imgData && imgData.imageUrl) {
                const imageUrl = imgData.imageUrl;
                setReferences((prev: any[]) => prev.map(r => r.id === ref.id ? { ...r, image: imageUrl } : r));
            }
          } catch (error) {
            console.error(`Failed to generate image for ${ref.id}:`, error);
          }
        }
      });
    },
    onError: (error: Error) => {
      const axiosError = error as { response?: { data?: { error?: string } } };
      alert(axiosError.response?.data?.error || "Failed to generate plan.");
    }
  });

  const generateMediaMutation = useGenerateMediaMutation({
    onSuccess: (data: { sceneResults: Partial<Scene>[] }) => {
      setScenes((prev: Scene[]) => prev.map((scene: Scene) => {
        const result = data.sceneResults.find((r) => r.id === scene.id);
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
          const result = data.sceneResults.find(r => r.id === clip.sceneId);
          if (result && result.audioDuration) {
            return { ...clip, end: clip.start + result.audioDuration };
          }
          return clip;
        });
        return normalizeTimelineClips(nextClips);
      });

      alert("Media generation complete!");
    },
    onError: (error: Error) => {
      const axiosError = error as { response?: { data?: { error?: string } } };
      alert(axiosError.response?.data?.error || "Failed to generate media.");
    }
  });

  return {
    generateConceptsMutation,
    orchestrateMutation,
    generateMediaMutation
  };
}
