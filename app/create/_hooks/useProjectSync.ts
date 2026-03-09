"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ProjectData, Scene, ReferenceCard, PlanConcept, VideoSettings } from "../types";
import { StoryboardTimelineClip } from "@/components/timeline/storyboard-timeline";
import { defaultScenes } from "../constants";
import { buildInitialTimelineClips } from "../_utils";
import { 
  useProjectQuery, 
  useSaveProjectMutation, 
  useAiAvatarsQuery 
} from "./index";

interface SyncState {
  productName: string;
  description: string;
  imageFiles: File[];
  scenes: Scene[];
  references: ReferenceCard[];
  plans: PlanConcept[];
  selectedPlanIndex: number;
  settings: VideoSettings;
  captions: boolean;
  music: string;
  previewUrls: { name: string; url: string }[];
}

export function useProjectSync(state: SyncState, setters: {
  setProductName: (v: string) => void;
  setDescription: (v: string) => void;
  setScenes: (v: Scene[]) => void;
  setCaptions: (v: boolean) => void;
  setMusic: (v: string) => void;
  setPlans: (v: PlanConcept[]) => void;
  setSelectedPlanIndex: (v: number) => void;
  setSettings: (v: (prev: VideoSettings) => VideoSettings) => void;
  setTimelineClips: (v: StoryboardTimelineClip[]) => void;
  setReferences: (v: ReferenceCard[]) => void;
  setPreviewUrls: (v: Array<{ name: string; url: string }>) => void;
}) {
  const searchParams = useSearchParams();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [projectLoaded, setProjectLoaded] = useState(false);
  const [isAiAvatarLibraryOpen, setIsAiAvatarLibraryOpen] = useState(false);
  const [aiAvatars, setAiAvatars] = useState<string[]>([]);
  const [loadingAvatars, setLoadingAvatars] = useState(false);

  const saveProjectMutation = useSaveProjectMutation();

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) setProjectId(id);
  }, [searchParams]);

  const { data: projectData } = useProjectQuery(projectId);

  const saveProjectWithData = useCallback(async (data: ProjectData) => {
    setSaving(true);
    try {
      const result = await saveProjectMutation.mutateAsync({
        ...data,
        id: projectId || undefined
      });
      if (result.projectId && !projectId) {
        setProjectId(result.projectId);
        window.history.replaceState({}, "", `?id=${result.projectId}`);
      }
    } catch (err) {
      console.error("Failed to save project:", err);
    } finally {
      setSaving(false);
    }
  }, [projectId, saveProjectMutation]);

  const saveProject = useCallback(async () => {
    await saveProjectWithData({
      productName: state.productName,
      description: state.description,
      imageNames: state.imageFiles.map((file) => file.name),
      selectedReference: null,
      scenes: state.scenes,
      references: state.references,
      plans: state.plans,
      selectedPlanIndex: state.selectedPlanIndex,
      settings: state.settings,
      captions: state.captions,
      music: state.music
    });
  }, [state, saveProjectWithData]);

  // Initial Load
  useEffect(() => {
    if (projectData && !projectLoaded) {
      setters.setProductName(projectData.productName);
      setters.setDescription(projectData.description || "");
      setters.setScenes((projectData.scenes || defaultScenes).map((s: Scene) => ({
        ...s,
        videoScript: s.videoScript || ""
      })));
      setters.setCaptions(projectData.captions ?? true);
      setters.setMusic(projectData.music || "ambient-glow");
      
      if (projectData.plans && (projectData.plans as PlanConcept[]).length > 0) {
        setters.setPlans(projectData.plans as PlanConcept[]);
        setters.setSelectedPlanIndex(projectData.selectedPlanIndex || 0);
      }
      if (projectData.settings) {
        setters.setSettings((prev: VideoSettings) => ({ ...prev, ...projectData.settings }));
      }
      if (projectData.scenes && projectData.scenes.length > 0) {
        setters.setTimelineClips(buildInitialTimelineClips(projectData.scenes));
      }
      if (projectData.references && projectData.references.length > 0) {
        setters.setReferences(projectData.references);
        const uploadedItems = projectData.references
          .filter((r: ReferenceCard) => r.image.includes("supabase") || r.image.includes("blob") || r.originalName)
          .map((r: ReferenceCard) => ({ name: r.originalName || r.label, url: r.image }));
        if (uploadedItems.length > 0) {
          setters.setPreviewUrls(uploadedItems);
        }
      }
      setProjectLoaded(true);
    }
  }, [projectData, projectLoaded, setters]);

  // Auto-save
  useEffect(() => {
    if (!projectId || !projectLoaded) return;
    const delayDebounceFn = setTimeout(() => {
      saveProject();
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [projectId, saveProject, projectLoaded]);

  // AI Avatars
  const aiAvatarsQuery = useAiAvatarsQuery(isAiAvatarLibraryOpen && aiAvatars.length === 0);
  useEffect(() => {
    if (aiAvatarsQuery.data && aiAvatars.length === 0) {
      setAiAvatars(aiAvatarsQuery.data);
    }
  }, [aiAvatarsQuery.data, aiAvatars.length]);
  useEffect(() => {
    setLoadingAvatars(aiAvatarsQuery.isLoading || aiAvatarsQuery.isFetching);
  }, [aiAvatarsQuery.isLoading, aiAvatarsQuery.isFetching]);

  return {
    projectId,
    saving,
    saveProject,
    saveProjectWithData,
    isAiAvatarLibraryOpen, setIsAiAvatarLibraryOpen,
    aiAvatars,
    loadingAvatars
  };
}
