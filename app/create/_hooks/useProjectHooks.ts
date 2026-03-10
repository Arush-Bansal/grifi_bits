import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ProjectData } from "../types";
import { useAppMutation, AppMutationOptions } from "../../_hooks/use-app-mutation";

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

export const useSaveProjectMutation = (options?: AppMutationOptions<ProjectData, Error, ProjectData, { previousProject: ProjectData | undefined; previousProjects: ProjectData[] | undefined }>) => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: async (data: ProjectData) => {
      const { data: responseData } = await axios.post<ProjectData>("/api/projects", data);
      return responseData;
    },
    onMutate: async (newProject) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["project", newProject.id] });
      await queryClient.cancelQueries({ queryKey: ["projects"] });

      // Snapshot the previous values
      const previousProject = queryClient.getQueryData<ProjectData>(["project", newProject.id]);
      const previousProjects = queryClient.getQueryData<ProjectData[]>(["projects"]);

      // Optimistically update the individual project
      if (newProject.id) {
        queryClient.setQueryData<ProjectData>(["project", newProject.id], (old) => ({
          ...old,
          ...newProject,
        }) as ProjectData);
      }

      // Optimistically update the projects list
      queryClient.setQueryData<ProjectData[]>(["projects"], (old) => {
        if (!old) return [newProject];
        const exists = old.find(p => p.id === newProject.id);
        if (exists) {
          return old.map(p => p.id === newProject.id ? { ...p, ...newProject } : p);
        }
        return [newProject, ...old];
      });

      return { previousProject, previousProjects };
    },
    onError: (err, newProject, context) => {
      if (newProject.id && context?.previousProject) {
        queryClient.setQueryData(["project", newProject.id], context.previousProject);
      }
      if (context?.previousProjects) {
        queryClient.setQueryData(["projects"], context.previousProjects);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    ...options
  });
};

export const useDeleteProjectMutation = (options?: AppMutationOptions<{ success: boolean }, Error, string, { previousProjects: ProjectData[] | undefined }>) => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: async (projectId: string) => {
      const { data } = await axios.delete(`/api/projects/${projectId}`);
      return data;
    },
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previousProjects = queryClient.getQueryData<ProjectData[]>(["projects"]);

      queryClient.setQueryData<ProjectData[]>(["projects"], (old) => {
        return old?.filter(p => p.id !== projectId) || [];
      });

      return { previousProjects };
    },
    onError: (err, projectId, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(["projects"], context.previousProjects);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    ...options
  });
};
