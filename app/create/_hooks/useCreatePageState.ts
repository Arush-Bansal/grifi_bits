"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import "@xzdarcy/react-timeline-editor/dist/react-timeline-editor.css";
import { type StoryboardTimelineClip } from "@/components/timeline/storyboard-timeline";


// Types & Constants
import { OrchestrationResult, ReferenceCard, Scene, SceneResult, Step } from "../types";
import {
  buildInitialTimelineClips,
  normalizeTimelineClips
} from "../_utils";
import {
  useGenerateConceptsMutation,
  useOrchestrateMutation,
  useGenerateMediaMutation
} from "./index";

import { useReferenceState } from "./useReferenceState";
import { useSceneState } from "./useSceneState";
import { useProductInfo } from "./useProductInfo";
import { useAiPlan } from "./useAiPlan";
import { useProjectSync } from "./useProjectSync";



export function useCreatePageState() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Sub-hooks
  const productInfo = useProductInfo();
  const sceneState = useSceneState();
  const referenceState = useReferenceState();
  const aiPlan = useAiPlan();
  
  const [captions, setCaptions] = useState(true);
  const [music, setMusic] = useState("ambient-glow");

  const step = useMemo(() => {
    if (pathname.includes("/setup")) return 0 as Step;
    if (pathname.includes("/concepts")) return 1 as Step;
    if (pathname.includes("/references")) return 2 as Step;
    if (pathname.includes("/scenes")) return 3 as Step;
    if (pathname.includes("/preview")) return 4 as Step;
    return 0 as Step;
  }, [pathname]);

  const setStep = useCallback((targetStep: Step | ((prev: Step) => Step)) => {
    const nextStep = typeof targetStep === "function" ? targetStep(step) : targetStep;
    const stepToRoute: Record<number, string> = {
      0: "/create/setup",
      1: "/create/concepts",
      2: "/create/references",
      3: "/create/scenes",
      4: "/create/preview",
    };
    const projectId = searchParams.get("id");
    const url = `${stepToRoute[nextStep]}${projectId ? `?id=${projectId}` : ""}`;
    router.push(url);
  }, [router, searchParams, step]);

  const syncState = {
    productName: productInfo.productName,
    description: productInfo.description,
    imageFiles: productInfo.imageFiles,
    scenes: sceneState.scenes,
    references: referenceState.references,
    plans: aiPlan.plans,
    selectedPlanIndex: aiPlan.selectedPlanIndex,
    settings: aiPlan.settings,
    captions,
    music,
    previewUrls: productInfo.previewUrls
  };

  const setters = {
    setProductName: productInfo.setProductName,
    setDescription: productInfo.setDescription,
    setScenes: sceneState.setScenes,
    setCaptions,
    setMusic,
    setPlans: aiPlan.setPlans,
    setSelectedPlanIndex: aiPlan.setSelectedPlanIndex,
    setSettings: aiPlan.setSettings,
    setTimelineClips: sceneState.setTimelineClips,
    setReferences: referenceState.setReferences,
    setPreviewUrls: productInfo.setPreviewUrls
  };

  const projectSync = useProjectSync(syncState, setters);

  const generateConceptsMutation = useGenerateConceptsMutation({
    onSuccess: (data) => {
      aiPlan.setPlans(data.concepts);
      aiPlan.setSelectedPlanIndex(0);
      setStep(1);
      projectSync.saveProjectWithData({
        ...syncState,
        imageNames: productInfo.imageFiles.map((f: File) => f.name),
        selectedReference: null,
        plans: data.concepts,
        selectedPlanIndex: 0
      });
    },
    onError: (error: Error) => {
      const axiosError = error as { response?: { data?: { error?: string } } };
      alert(axiosError.response?.data?.error || "Failed to generate concepts.");
    }
  });

  const orchestrateMutation = useOrchestrateMutation({
    onSuccess: async (data: OrchestrationResult) => {
      const uploadedRefs: ReferenceCard[] = (data.UPLOADED_IMAGE_SPECS || []).map((spec) => {
        const matched = productInfo.previewUrls.find((p: { name: string; url: string }) => p.name === spec.original_name);
        const image = matched ? matched.url : "https://via.placeholder.com/300";
        return {
          id: `uploaded-${spec.original_name}`,
          label: spec.ai_name.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          tagline: spec.ai_description,
          image,
          originalName: spec.original_name
        };
      });

      const aiRefs: ReferenceCard[] = data.REFERENCE_SPECS.map((spec) => ({
        id: spec.id,
        label: spec.name.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        tagline: spec.description,
        image: "https://via.placeholder.com/300x300?text=Generating...",
        aiPrompt: spec.prompt
      }));

      const nextReferences = [...uploadedRefs, ...aiRefs];
      referenceState.setReferences(nextReferences);

      const nextScenes = data.SCENES.map((scene, index: number) => ({
        id: index + 1,
        name: scene.name,
        imagePrompt: scene.image_prompt,
        videoScript: scene.video_prompt,
        audioPrompt: scene.speech
      }));
      sceneState.setScenes(nextScenes);
      sceneState.setTimelineClips(buildInitialTimelineClips(nextScenes));

      setStep(2);

      // Async image generation for AI refs
      data.REFERENCE_SPECS.forEach(async (spec) => {
        try {
          const imgData = await sceneState.handleGenerateSceneImage(0, spec.prompt); // Hack: use 0 as fake sceneId
          if (imgData && imgData.imageUrl) {
              const imageUrl = imgData.imageUrl;
              referenceState.setReferences(prev => prev.map(r => r.id === spec.id ? { ...r, image: imageUrl } : r));
          }
        } catch (error) {
          console.error(`Failed to generate image for ${spec.id}:`, error);
        }
      });
    },
    onError: (error: Error) => {
      const axiosError = error as { response?: { data?: { error?: string } } };
      alert(axiosError.response?.data?.error || "Failed to generate plan.");
    }
  });

  const generateMediaMutation = useGenerateMediaMutation({
    onSuccess: (data: { sceneResults: SceneResult[] }) => {
      sceneState.setScenes((prev: Scene[]) => prev.map((scene: Scene) => {
        const result = data.sceneResults.find((r) => r.id === scene.id);
        if (result) {
          return {
            ...scene,
            imagePreview: result.imageUrl,
            videoUrl: result.videoUrl,
            audioUrl: result.audioUrl,
            audioDuration: result.audioDuration
          };
        }
        return scene;
      }));

      sceneState.setTimelineClips((prev: StoryboardTimelineClip[]) => {
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

  const stepTitle = ["Product Setup", "Plan Selection", "Reference Style", "Scenes", "Final Preview"][step];

  return {
    ...productInfo,
    ...sceneState,
    ...referenceState,
    ...aiPlan,
    ...projectSync,
    captions, setCaptions,
    music, setMusic,
    generateConceptsMutation,
    orchestrateMutation,
    generateMediaMutation,
    step, setStep,
    stepTitle
  };
}
