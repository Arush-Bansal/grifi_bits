"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { ReferenceCard } from "../types";
import { useProject } from "./useProject";

export function useReferenceState() {
  const { projectData, uiState, updateCache, updateUiCache } = useProject();
  
  const references = useMemo(() => projectData?.references || [], [projectData?.references]);
  const [customReferenceCount, setCustomReferenceCount] = useState(1);
  const editingRefId = useMemo(() => uiState.editingRefId, [uiState.editingRefId]);
  const referenceObjectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (references.length > 0) {
      const customCount = references.filter(r => typeof r?.id === "string" && r.id.startsWith("custom-")).length;
      setCustomReferenceCount(customCount + 1);
    }
  }, [references]);

  useEffect(() => {
    const currentRefs = referenceObjectUrlsRef.current;
    return () => {
      currentRefs.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

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

  const updateReferenceImage = useCallback((referenceId: string, files: FileList | null) => {
    const nextFile = files?.[0];
    if (!nextFile) return;

    const nextImageUrl = URL.createObjectURL(nextFile);
    referenceObjectUrlsRef.current.push(nextImageUrl);

    setReferences((prev) =>
      prev.map((reference) => (reference.id === referenceId ? { ...reference, image_url: nextImageUrl } : reference))
    );
  }, [setReferences]);

  const addReferenceCard = useCallback((files: FileList | null) => {
    const nextFile = files?.[0];
    if (!nextFile) return;

    const nextImageUrl = URL.createObjectURL(nextFile);
    referenceObjectUrlsRef.current.push(nextImageUrl);

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
