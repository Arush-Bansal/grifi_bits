"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ReferenceCard } from "../types";

export function useReferenceState() {
  const [references, setReferences] = useState<ReferenceCard[]>([]);
  const [customReferenceCount, setCustomReferenceCount] = useState(1);
  const [editingRefId, setEditingRefId] = useState<string | null>(null);
  const referenceObjectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    const currentRefs = referenceObjectUrlsRef.current;
    return () => {
      currentRefs.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const updateReferenceLimit = useCallback((id: string, key: "label" | "tagline", value: string) => {
    setReferences((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: value } : r))
    );
  }, []);

  const updateReferenceImage = useCallback((referenceId: string, files: FileList | null) => {
    const nextFile = files?.[0];
    if (!nextFile) return;

    const nextImageUrl = URL.createObjectURL(nextFile);
    referenceObjectUrlsRef.current.push(nextImageUrl);

    setReferences((prev) =>
      prev.map((reference) => (reference.id === referenceId ? { ...reference, image: nextImageUrl } : reference))
    );
  }, []);

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
        image: nextImageUrl
      }
    ]);
  }, [customReferenceCount]);

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
        image: imageUrl
      }
    ]);
  }, [customReferenceCount]);

  return {
    references,
    setReferences,
    customReferenceCount,
    setCustomReferenceCount,
    editingRefId,
    setEditingRefId,
    updateReferenceLimit,
    updateReferenceImage,
    addReferenceCard,
    addAiAvatarReference
  };
}
