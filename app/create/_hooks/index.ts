import { useMutation, useQuery, UseMutationOptions } from "@tanstack/react-query";
import axios from "axios";
import { ProjectData, OrchestrationResult, PlanConcept, VideoSettings, Scene } from "../types";

export const useProjectQuery = (projectId: string | null) => {
  return useQuery<ProjectData>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data } = await axios.get<ProjectData>(`/api/projects/${projectId}`);
      return data;
    },
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
};

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

export const useProjectsQuery = () => {
  return useQuery<ProjectData[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await axios.get<ProjectData[]>("/api/projects");
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });
};


export const useSaveProjectMutation = (options?: UseMutationOptions<{ projectId: string }, Error, ProjectData>) => {
  return useMutation({
    mutationFn: async (data: ProjectData) => {
      const { data: responseData } = await axios.post("/api/projects", data);
      return responseData;
    },
    ...options
  });
};

export const useFetchLinkMutation = (options?: UseMutationOptions<{ title?: string; description?: string; imageUrls?: string[] }, Error, string>) => {
  return useMutation({
    mutationFn: async (url: string) => {
      const { data } = await axios.post("/api/fetch-link", { url });
      return data;
    },
    ...options
  });
};

export const useGenerateConceptsMutation = (options?: UseMutationOptions<{ concepts: PlanConcept[] }, Error, { product_name: string; product_description: string }>) => {
  return useMutation({
    mutationFn: async (params: { product_name: string; product_description: string }) => {
      const { data } = await axios.post("/api/generate-concepts", params);
      return data;
    },
    ...options
  });
};

export const useOrchestrateMutation = (options?: UseMutationOptions<OrchestrationResult, Error, {
  product_id?: string;
  product_name: string;
  product_description: string;
  image_names: string[];
  selected_plan?: string;
  settings: VideoSettings;
}>) => {
  return useMutation({
    mutationFn: async (params: {
      product_id?: string;
      product_name: string;
      product_description: string;
      image_names: string[];
      selected_plan?: string;
      settings: VideoSettings;
    }) => {
      const { data } = await axios.post("/api/orchestrate", params);
      return data;
    },
    ...options
  });
};

interface PreviewSceneParams {
  type: "image" | "audio" | "both";
  imagePrompt?: string;
  audioScript?: string;
  voiceId?: string;
  mainReference?: string;
  secondaryReference?: string;
}

export const usePreviewSceneMutation = (options?: UseMutationOptions<{ imageUrl?: string; audioUrl?: string; audioDuration?: number }, Error, PreviewSceneParams>) => {
  return useMutation({
    mutationFn: async (params: PreviewSceneParams) => {
      const { data } = await axios.post("/api/preview-scene", params);
      return data;
    },
    ...options
  });
};

interface GenerateMediaParams {
  scenes: Array<Scene & { videoPrompt: string }>;
  references: Record<string, string>;
  voiceId: string;
}

export const useGenerateMediaMutation = (options?: UseMutationOptions<{ sceneResults: Partial<Scene>[] }, Error, GenerateMediaParams>) => {
  return useMutation({
    mutationFn: async (params: GenerateMediaParams) => {
      const { data } = await axios.post("/api/generate-media", params);
      return data;
    },
    ...options
  });
};


