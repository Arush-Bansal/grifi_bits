"use client";

import { Scene, Step, ProjectData } from "../types";
import {
  useOrchestrateMutation,
  useRemotionRenderMutation
} from "./index";
import { useProject } from "./useProject";

interface MutationDeps {
  setStep: (step: Step) => void;
  setScenes: (scenes: Scene[] | ((prev: Scene[]) => Scene[])) => void;
}

export function useCreateMutations(deps: MutationDeps) {
  const {
    projectData,
    queryClient,
    updateCache,
    updateUiCache,
    saveProjectWithData
  } = useProject();

  const {
    setStep,
  } = deps;


  const orchestrateMutation = useOrchestrateMutation({
    onSuccess: async (data: ProjectData) => {
      // 1. Ensure auto-save is suspended (though it should already be from step-navigation)
      updateUiCache({ isAutoSaveSuspended: true });

      // 2. Update cache IN ONE GO with the authoritative data from orchestration
      if (data.id) {
        queryClient.setQueryData(["project", data.id], data);
      }

      // 3. Move to Step 2 (Final Preview)
      setStep(2);

      // 4. Resume auto-save once primary state is settled
      updateUiCache({ isAutoSaveSuspended: false });
    },
    onError: () => {
      updateUiCache({ isAutoSaveSuspended: false });
    }
  });

  
  const remotionRenderMutation = useRemotionRenderMutation({
    successMessage: "Video rendering complete!",
    onSuccess: (data: { videoUrl: string }) => {
      if (projectData) {
        const nextData = {
          ...projectData,
          settings: {
            ...projectData.settings,
            final_video_url: data.videoUrl
          } as ProjectData["settings"]
        };

        // Reflect the generated video URL in UI immediately.
        updateCache(nextData);
        saveProjectWithData(nextData);
      }
    }
  });

  return {
    orchestrateMutation,
    remotionRenderMutation
  };
}
