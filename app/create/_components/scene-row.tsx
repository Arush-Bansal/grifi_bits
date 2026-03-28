"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pencil, MessageSquare } from "lucide-react";
import { useScene } from "../_hooks/useScene";
import { useSceneState } from "../_hooks/useSceneState";

export function SceneRow({ projectId, sceneId }: { projectId: string; sceneId: number }) {
  const {
    scene,
  } = useScene(projectId, sceneId);

  const {
    updateScene,
  } = useSceneState();

  if (!scene) return null;

  return (
    <article className="grid gap-4 border-b border-border/60 bg-white/75 p-4 last:border-b-0 md:grid-cols-[140px_1fr] md:gap-0 md:p-0">
      <div className="md:border-r md:border-border/60 md:px-4 md:py-4">
        <p className="text-xs uppercase tracking-[0.16em] text-primary font-bold">Scene {scene.id}</p>
      </div>

      <div className="space-y-3 md:px-4 md:py-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Video Script
            </p>
            <button type="button" className="inline-flex items-center gap-1 text-xs text-primary">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
          <Textarea
            value={scene.video_prompt}
            onChange={(e) => updateScene(scene.id, "video_prompt", e.target.value)}
            className="min-h-[92px] bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <MessageSquare className="h-3 w-3" /> Speech / Voiceover
          </Label>
          <Textarea
            value={scene.speech || ""}
            onChange={(e) => updateScene(scene.id, "speech", e.target.value)}
            placeholder="Enter voiceover text for this scene..."
            className="min-h-[60px] bg-white text-sm"
          />
        </div>
      </div>
    </article>
  );
}
