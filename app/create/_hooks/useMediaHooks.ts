import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Scene } from "../types";
import { useAppMutation, AppMutationOptions } from "../../_hooks/use-app-mutation";

export const useAiAvatarsQuery = (enabled: boolean) => {
  return useQuery<string[]>({
    queryKey: ["ai-avatars"],
    queryFn: async () => {
      const { data } = await axios.get("/api/ai-avatars");
      return data.avatars || [];
    },
    enabled,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
};

interface PreviewSceneParams {
  type: "image" | "audio" | "both";
  image_prompt?: string;
  speech?: string;
  voice_id?: string;
  main_reference?: string;
  secondary_reference?: string;
}

export const usePreviewSceneMutation = (options?: AppMutationOptions<{ image_url?: string; audio_url?: string; audio_duration?: number }, Error, PreviewSceneParams>) => {
  return useAppMutation({
    mutationFn: async (params: PreviewSceneParams) => {
      const { data } = await axios.post("/api/preview-scene", params);
      return data;
    },
    ...options
  });
};

interface GenerateMediaParams {
  scenes: Array<Scene & { video_prompt: string }>;
  references: Record<string, string>;
  voice_id: string;
}

export const useGenerateMediaMutation = (options?: AppMutationOptions<{ scene_results: Partial<Scene>[] }, Error, GenerateMediaParams>) => {
  return useAppMutation({
    mutationFn: async (params: GenerateMediaParams) => {
      const { data } = await axios.post("/api/generate-media", params);
      return data;
    },
    ...options
  });
};
