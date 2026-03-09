import { useMutation, useQuery, UseMutationOptions } from "@tanstack/react-query";
import axios from "axios";
import { ProjectData, OrchestrationResult } from "../types";

export const useProjectQuery = (projectId: string | null) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/projects/${projectId}`);
      return data;
    },
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
};

export const useAiAvatarsQuery = (enabled: boolean) => {
  return useQuery({
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
  return useQuery<any[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await axios.get("/api/projects");
      return data;
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

export const useGenerateConceptsMutation = (options?: UseMutationOptions<{ concepts: any[] }, Error, { productName: string; description: string }>) => {
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
  settings: any;
}>) => {
  return useMutation({
    mutationFn: async (params: {
      productName: string;
      description: string;
      imageNames: string[];
      selectedPlan?: string;
      settings: any;
    }) => {
      const { data } = await axios.post("/api/orchestrate", params);
      return data;
    },
    ...options
  });
};

export const usePreviewSceneMutation = (options?: UseMutationOptions<{ imageUrl?: string; audioUrl?: string; audioDuration?: number }, Error, any>) => {
  return useMutation({
    mutationFn: async (params: any) => {
      const { data } = await axios.post("/api/preview-scene", params);
      return data;
    },
    ...options
  });
};

export const useGenerateMediaMutation = (options?: UseMutationOptions<{ sceneResults: any[] }, Error, any>) => {
  return useMutation({
    mutationFn: async (params: any) => {
      const { data } = await axios.post("/api/generate-media", params);
      return data;
    },
    ...options
  });
};
