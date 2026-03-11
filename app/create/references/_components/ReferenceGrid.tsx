"use client";

import { ReferenceCardItem } from "../../_components/reference-card-item";
import { AddReferenceCard } from "./AddReferenceCard";
import { AiAvatarLibraryCard } from "./AiAvatarLibraryCard";
import { ReferenceCard } from "../../types";

interface ReferenceGridProps {
  projectId: string;
  references: ReferenceCard[];
  onAddReference: (files: FileList | null) => void;
  onOpenAiLibrary: () => void;
}

export function ReferenceGrid({
  projectId,
  references,
  onAddReference,
  onOpenAiLibrary,
}: ReferenceGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {references.map((reference) => (
        <ReferenceCardItem 
          key={reference.id} 
          projectId={projectId} 
          referenceId={reference.id} 
        />
      ))}
      <AddReferenceCard onAdd={onAddReference} />
      <AiAvatarLibraryCard onOpen={onOpenAiLibrary} />
    </div>
  );
}
