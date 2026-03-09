"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ProjectData, ProjectUiState, initialProjectUiState } from "../types";
import { useProjectQuery, useSaveProjectMutation } from "./index";
import { useAutoSave } from "../../_hooks/use-auto-save";

export function useProject() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) setProjectId(id);
  }, [searchParams]);

  const { data: projectData, isSuccess: isProjectLoaded } = useProjectQuery(projectId);
  const saveProjectMutation = useSaveProjectMutation();

  const updateCache = useCallback((updater: Partial<ProjectData> | ((old: ProjectData) => Partial<ProjectData>)) => {
    if (!projectId) return;
    queryClient.setQueryData<ProjectData>(["project", projectId], (old) => {
      if (!old) return old;
      const newData = typeof updater === "function" ? updater(old) : updater;
      return {
        ...old,
        ...newData,
      } as ProjectData;
    });
  }, [projectId, queryClient]);

  const saveProjectWithData = useCallback(async (data: ProjectData) => {
    try {
      const result = await saveProjectMutation.mutateAsync({
        ...data,
        id: projectId || undefined
      }) as ProjectData;
      
      if (result?.id && !projectId) {
        setProjectId(result.id);
        const url = new URL(window.location.href);
        url.searchParams.set("id", result.id);
        window.history.replaceState({}, "", url.toString());
      }
    } catch (err) {
      console.error("Failed to save project:", err);
    }
  }, [projectId, saveProjectMutation]);

  // UI State Cache (transient, never sent to server)
  const { data: uiState = initialProjectUiState } = useQuery<ProjectUiState>({
    queryKey: ["project-ui", projectId],
    enabled: !!projectId,
    initialData: initialProjectUiState,
    staleTime: Infinity,
  });

  const updateUiCache = useCallback((updater: Partial<ProjectUiState> | ((old: ProjectUiState) => Partial<ProjectUiState>)) => {
    if (!projectId) return;
    queryClient.setQueryData<ProjectUiState>(["project-ui", projectId], (old = initialProjectUiState) => {
      const newData = typeof updater === "function" ? updater(old) : updater;
      return {
        ...old,
        ...newData,
      };
    });
  }, [projectId, queryClient]);

  // Strip server-assigned timestamps to prevent infinite loops on auto-save
  const savableData = projectData ? { ...projectData } : null;
  if (savableData) {
    delete savableData.updated_at;
    delete savableData.created_at;
  }

  // Centralized auto-save logic
  useAutoSave(
    savableData,
    (data) => saveProjectWithData(data as ProjectData),
    !!projectId && isProjectLoaded && !!projectData
  );

  return {
    projectId,
    projectData,
    uiState,
    isProjectLoaded,
    updateCache,
    updateUiCache,
    saveProjectWithData,
    saving: saveProjectMutation.isPending
  };
}
