"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useProjectQuery } from "./index";
import { ProjectUiState, initialProjectUiState } from "../types";

export function useReference(projectId: string | null, referenceId: string) {
  const { data: projectData } = useProjectQuery(projectId);

  const { data: uiState = initialProjectUiState } = useQuery<ProjectUiState>({
    queryKey: ["project-ui", projectId],
    queryFn: () => initialProjectUiState,
    enabled: !!projectId,
    staleTime: Infinity,
  });

  const reference = useMemo(() => 
    projectData?.references?.find((r) => r.id === referenceId) || null
  , [projectData?.references, referenceId]);

  const isEditing = useMemo(() => 
    uiState.editingRefId === referenceId
  , [uiState.editingRefId, referenceId]);

  return {
    reference,
    isEditing
  };
}
