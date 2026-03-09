"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useProjectQuery } from "./index";
import { ProjectUiState, initialProjectUiState } from "../types";

export function useScene(projectId: string | null, sceneId: number) {
  const { data: projectData } = useProjectQuery(projectId);

  const { data: uiState = initialProjectUiState } = useQuery<ProjectUiState>({
    queryKey: ["project-ui", projectId],
    enabled: !!projectId,
    initialData: initialProjectUiState,
    staleTime: Infinity,
  });

  const scene = useMemo(() => {
    if (!projectData?.scenes) return null;
    const scenesWithIds = projectData.scenes.map((s, index) => ({
      ...s,
      id: s.id ?? index + 1
    }));
    return scenesWithIds.find((s) => s.id === sceneId) || null;
  }, [projectData?.scenes, sceneId]);

  const isGeneratingImage = useMemo(() => 
    uiState.sceneGenerating[sceneId]?.image || false
  , [uiState.sceneGenerating, sceneId]);

  const isGeneratingAudio = useMemo(() => 
    uiState.sceneGenerating[sceneId]?.audio || false
  , [uiState.sceneGenerating, sceneId]);

  const isEditingImagePrompt = useMemo(() => 
    uiState.editingImagePrompt[sceneId] || false
  , [uiState.editingImagePrompt, sceneId]);

  const isEditingAudioPrompt = useMemo(() => 
    uiState.editingAudioPrompt[sceneId] || false
  , [uiState.editingAudioPrompt, sceneId]);

  return {
    scene,
    isGeneratingImage,
    isGeneratingAudio,
    isEditingImagePrompt,
    isEditingAudioPrompt
  };
}
