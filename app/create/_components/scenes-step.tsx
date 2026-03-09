import { Button } from "@/components/ui/button";
import { Loader2, Music2, Video } from "lucide-react";
import { SceneRow } from "./scene-row";
import { useSceneState } from "../_hooks/useSceneState";
import { useReferenceState } from "../_hooks/useReferenceState";

interface ScenesStepProps {
  projectId: string;
}

export function ScenesStep({ projectId }: ScenesStepProps) {
  const { 
    scenes, 
    handleGenerateAllImages, 
    handleGenerateAllAudios, 
    isGeneratingAllImages, 
    isGeneratingAllAudios 
  } = useSceneState();

  const { references } = useReferenceState();

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Each row is one scene with editable prompts and read-only mock previews for start image and audio.
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 text-xs font-semibold uppercase tracking-wider"
            onClick={handleGenerateAllImages}
            disabled={isGeneratingAllImages}
          >
            {isGeneratingAllImages ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Video className="mr-2 h-3.5 w-3.5" />
            )}
            {isGeneratingAllImages ? "Generating All..." : "Generate All Images"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 text-xs font-semibold uppercase tracking-wider border-primary/30 text-primary hover:bg-primary/5"
            onClick={handleGenerateAllAudios}
            disabled={isGeneratingAllAudios}
          >
            {isGeneratingAllAudios ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Music2 className="mr-2 h-3.5 w-3.5" />
            )}
            {isGeneratingAllAudios ? "Generating All..." : "Generate All Audios"}
          </Button>
        </div>
      </div>
      <div className="mesh-bg overflow-x-auto rounded-2xl border border-border/70 bg-background/70">
        <div className="w-full">
          <div className="hidden grid-cols-[140px_1fr_1.2fr_1.2fr] border-b border-border/70 bg-secondary/40 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:grid">
            <p className="border-r border-border/60 px-4 py-3">Scene</p>
            <p className="border-r border-border/60 px-4 py-3">Video Script</p>
            <p className="border-r border-border/60 px-4 py-3">Start Image</p>
            <p className="px-4 py-3">Audio</p>
          </div>

          {scenes.map((scene) => (
            <SceneRow 
              key={scene.id} 
              projectId={projectId} 
              sceneId={scene.id} 
              references={references}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
