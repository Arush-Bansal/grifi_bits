import { useMutation, useQuery, UseMutationOptions } from "@tanstack/react-query";
import axios from "axios";
import { ProjectData, OrchestrationResult, PlanConcept, VideoSettings, ProjectDBData, Scene, SceneResult } from "../types";

const normalizeProject = (dbData: ProjectDBData): ProjectData & { id: string } => {
  return {
    id: dbData.id,
    productName: dbData.product_name,
    description: dbData.product_description,
    scenes: dbData.scenes,
    imageNames: dbData.image_names,
    captions: dbData.captions_enabled,
    music: dbData.music_track,
    references: dbData.references,
    selectedReference: dbData.selected_reference,
    plans: dbData.plans,
    selectedPlanIndex: dbData.selected_plan_index,
    settings: dbData.settings,
    createdAt: dbData.created_at,
  };
};

export const useProjectQuery = (projectId: string | null) => {
  return useQuery<ProjectData & { id: string }>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data } = await axios.get<ProjectDBData>(`/api/projects/${projectId}`);
      return normalizeProject(data);
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
  return useQuery<(ProjectData & { id: string })[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await axios.get<ProjectDBData[]>("/api/projects");
      return data.map(normalizeProject);
    },
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });
};

export const useSaveProjectMutation = (options?: UseMutationOptions<{ projectId: string }, Error, ProjectData & { id?: string }>) => {
  return useMutation({
    mutationFn: async (data: ProjectData & { id?: string }) => {
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

export const useGenerateConceptsMutation = (options?: UseMutationOptions<{ concepts: PlanConcept[] }, Error, { productName: string; description: string }>) => {
  return useMutation({
    mutationFn: async (params: { productName: string; description: string }) => {
      const { data } = await axios.post("/api/generate-concepts", params);
      return data;
    },
    ...options
  });
};

export const useOrchestrateMutation = (options?: UseMutationOptions<OrchestrationResult, Error, {
  productName: string;
  description: string;
  imageNames: string[];
  selectedPlan?: string;
  settings: VideoSettings;
}>) => {
  return useMutation({
    mutationFn: async (params: {
      productName: string;
      description: string;
      imageNames: string[];
      selectedPlan?: string;
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

export const useGenerateMediaMutation = (options?: UseMutationOptions<{ sceneResults: SceneResult[] }, Error, GenerateMediaParams>) => {
  return useMutation({
    mutationFn: async (params: GenerateMediaParams) => {
      const { data } = await axios.post("/api/generate-media", params);
      return data;
    },
    ...options
  });
};


