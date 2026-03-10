"use client";

import { useProject } from "../_hooks/useProject";
import { useAutoSave } from "../../_hooks/use-auto-save";
import { ProjectData } from "../types";

/**
 * ProjectAutoSaver is a renderless component that centralizes the auto-save logic.
 * It is mounted once at the layout level to prevent multiple competing auto-save instances.
 */
export function ProjectAutoSaver() {
  const { projectId, projectData, isProjectLoaded, uiState, saveProjectWithData } = useProject();

  // Strip server-assigned timestamps to prevent infinite loops on auto-save
  const savableData = projectData ? { ...projectData } : null;
  if (savableData) {
    const data = savableData as Record<string, unknown>;
    delete data.updated_at;
    delete data.created_at;
  }

  // Suspension of auto-save during critical transitions (like orchestration)
  const isSuspended = uiState.isAutoSaveSuspended === true;

  useAutoSave(
    savableData,
    (data) => saveProjectWithData(data as ProjectData),
    !!projectId && isProjectLoaded && !!projectData && !isSuspended
  );

  return null;
}
