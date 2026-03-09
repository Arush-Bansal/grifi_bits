import axios from "axios";
import { ProjectData, PlanConcept, VideoSettings } from "../types";
import { useAppMutation, AppMutationOptions } from "../../_hooks/use-app-mutation";

export const useFetchLinkMutation = (options?: AppMutationOptions<{ title?: string; description?: string; imageUrls?: string[] }, Error, string>) => {
  return useAppMutation({
    mutationFn: async (url: string) => {
      const { data } = await axios.post("/api/fetch-link", { url });
      return data;
    },
    ...options
  });
};

export const useGenerateConceptsMutation = (options?: AppMutationOptions<{ concepts: PlanConcept[] }, Error, { product_name: string; product_description: string }>) => {
  return useAppMutation({
    mutationFn: async (params: { product_name: string; product_description: string }) => {
      const { data } = await axios.post("/api/generate-concepts", params);
      return data;
    },
    ...options
  });
};

export const useOrchestrateMutation = (options?: AppMutationOptions<ProjectData, Error, {
  product_id?: string;
  product_name: string;
  product_description: string;
  image_names: string[];
  selected_plan?: string;
  settings: VideoSettings;
}>) => {
  return useAppMutation({
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
