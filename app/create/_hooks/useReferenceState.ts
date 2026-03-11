"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import axios from "axios";
import { ReferenceCard } from "../types";
import { useProject } from "./useProject";

export function useReferenceState() {
  const { projectData, uiState, updateCache, updateUiCache } = useProject();
  
  const references = useMemo(() => projectData?.references || [], [projectData?.references]);
  const [customReferenceCount, setCustomReferenceCount] = useState(1);
  const editingRefId = useMemo(() => uiState.editingRefId, [uiState.editingRefId]);

  useEffect(() => {
    if (references.length > 0) {
      const customCount = references.filter(r => typeof r?.id === "string" && r.id.startsWith("custom-")).length;
      setCustomReferenceCount(customCount + 1);
    }
  }, [references]);

  const setReferences = useCallback((newRefs: ReferenceCard[] | ((prev: ReferenceCard[]) => ReferenceCard[])) => {
    updateCache((old) => {
      const currentRefs = old.references || [];
      const next = typeof newRefs === "function" ? newRefs(currentRefs) : newRefs;
      return { references: next };
    });
  }, [updateCache]);

  const updateReferenceLimit = useCallback((id: string, key: "label" | "tagline", value: string) => {
    setReferences((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: value } : r))
    );
  }, [setReferences]);

  const updateReferenceImage = useCallback(async (referenceId: string, files: FileList | null) => {
    const nextFile = files?.[0];
    if (!nextFile) return;

    // Upload to server
    const formData = new FormData();
    formData.append("files", nextFile);

    try {
      const { data } = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.urls && data.urls.length > 0) {
        const nextImageUrl = data.urls[0];
        setReferences((prev) =>
          prev.map((reference) => (reference.id === referenceId ? { ...reference, image_url: nextImageUrl } : reference))
        );
      }
    } catch (err) {
      console.error("Upload failed in updateReferenceImage:", err);
    }
  }, [setReferences]);

  const addReferenceCard = useCallback(async (files: FileList | null) => {
    const nextFile = files?.[0];
    if (!nextFile) return;

    // Upload to server
    const formData = new FormData();
    formData.append("files", nextFile);

    try {
      const { data } = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.urls && data.urls.length > 0) {
        const nextImageUrl = data.urls[0];
        const nextCount = customReferenceCount;
        const nextReferenceId = `custom-${nextCount}`;

        setCustomReferenceCount((prev) => prev + 1);
        setReferences((prev) => [
          ...prev,
          {
            id: nextReferenceId,
            label: `Custom ${nextCount}`,
            tagline: "Custom reference image",
            image_url: nextImageUrl
          }
        ]);
      }
    } catch (err) {
      console.error("Upload failed in addReferenceCard:", err);
    }
  }, [customReferenceCount, setReferences]);

  const addAiAvatarReference = useCallback((imageUrl: string) => {
    const nextCount = customReferenceCount;
    const nextReferenceId = `custom-${nextCount}`;

    setCustomReferenceCount((prev) => prev + 1);
    setReferences((prev) => [
      ...prev,
      {
        id: nextReferenceId,
        label: `AI Avatar ${nextCount}`,
        tagline: "AI Generated Avatar",
        image_url: imageUrl
      }
    ]);
  }, [customReferenceCount, setReferences]);

  return {
    references,
    setReferences,
    customReferenceCount,
    setCustomReferenceCount,
    editingRefId,
    setEditingRefId: (id: string | null) => updateUiCache({ editingRefId: id }),
    updateReferenceLimit,
    updateReferenceImage,
    addReferenceCard,
    addAiAvatarReference,
    loading_avatars: false, // Defaulting as not implemented yet but used in layout
    ai_avatars: [] // Defaulting as not implemented yet but used in layout
  };
}
