"use client";

import { useMemo } from "react";
import { useProjectQuery } from "./index";

export function useScene(projectId: string | null, sceneId: number) {
  const { data: projectData } = useProjectQuery(projectId);


  const scene = useMemo(() => {
    if (!projectData?.scenes) return null;
    const scenesWithIds = projectData.scenes.map((s, index) => ({
      ...s,
      id: s.id ?? index + 1
    }));
    return scenesWithIds.find((s) => s.id === sceneId) || null;
  }, [projectData?.scenes, sceneId]);

  return {
    scene,
  };
}
