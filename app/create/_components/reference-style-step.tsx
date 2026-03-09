import { Input } from "@/components/ui/input";
import { UploadCloud } from "lucide-react";
import { ReferenceCardItem } from "./reference-card-item";
import { useReferenceState } from "../_hooks/useReferenceState";
import { useUIState } from "../_hooks/useUIState";

interface ReferenceStyleStepProps {
  projectId: string;
}

export function ReferenceStyleStep({ projectId }: ReferenceStyleStepProps) {
  const { references, addReferenceCard } = useReferenceState();
  const { setIsAiAvatarLibraryOpen } = useUIState();

  return (
    <div>
      <p className="mb-5 max-w-2xl text-sm text-muted-foreground">
        These references are all used in the next step. Edit any image or upload additional references.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {references.map((reference) => (
          <ReferenceCardItem 
            key={reference.id} 
            projectId={projectId} 
            referenceId={reference.id} 
          />
        ))}
        <article className="overflow-hidden rounded-2xl border border-dashed border-primary/40 bg-white/60">
          <label
            htmlFor="add-reference-image"
            className="flex min-h-[278px] cursor-pointer flex-col items-center justify-center gap-2 p-4 text-center"
          >
            <UploadCloud className="h-6 w-6 text-primary" />
            <p className="text-sm font-semibold text-foreground">Add reference</p>
            <p className="text-xs text-muted-foreground">Upload a new image card</p>
          </label>
          <Input
            id="add-reference-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              addReferenceCard(e.target.files);
              e.target.value = "";
            }}
          />
        </article>
        <article className="overflow-hidden rounded-2xl border border-dashed border-primary/40 bg-white/60">
          <button
            onClick={() => setIsAiAvatarLibraryOpen(true)}
            type="button"
            className="flex min-h-[278px] w-full cursor-pointer flex-col items-center justify-center gap-2 p-4 text-center hover:bg-white/40"
          >
            <span className="text-2xl">✨</span>
            <p className="text-sm font-semibold text-foreground">AI Avatar Library</p>
            <p className="text-xs text-muted-foreground">Select an AI avatar reference</p>
          </button>
        </article>
      </div>
    </div>
  );
}
