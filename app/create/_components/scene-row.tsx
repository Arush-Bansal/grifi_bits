"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Music2, Pencil, Video } from "lucide-react";
import Image from "next/image";
import { useScene } from "../_hooks/useScene";
import { useSceneState } from "../_hooks/useSceneState";
import { useUIState } from "../_hooks/useUIState";
import { ReferenceCard } from "../types";

interface SceneRowProps {
  projectId: string;
  sceneId: number;
  references: ReferenceCard[];
}

export function SceneRow({ projectId, sceneId, references }: SceneRowProps) {
  const { 
    scene, 
    isGeneratingImage, 
    isGeneratingAudio, 
    isEditingImagePrompt, 
    isEditingAudioPrompt 
  } = useScene(projectId, sceneId);

  const { 
    updateScene, 
    setScenes,
    setEditingImagePrompt,
    setEditingAudioPrompt,
    handleGenerateSceneImage,
    handleGenerateSceneAudio
  } = useSceneState();

  const { setLightboxImage } = useUIState();

  if (!scene) return null;

  return (
    <article className="grid gap-4 border-b border-border/60 bg-white/75 p-4 last:border-b-0 md:grid-cols-[140px_1fr_1.2fr_1.2fr] md:gap-0 md:p-0">
      <div className="md:border-r md:border-border/60 md:px-4 md:py-4">
        <p className="text-xs uppercase tracking-[0.16em] text-primary">Scene {scene.id}</p>
        <h3 className="mt-1 text-lg font-semibold">{scene.name}</h3>
      </div>

      <div className="space-y-2 md:border-r md:border-border/60 md:px-4 md:py-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground md:hidden">
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

      <div className="relative space-y-2 md:border-r md:border-border/60 md:px-4 md:py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground md:hidden">
          Start Image
        </p>

        <div className="relative overflow-hidden rounded-xl border border-border/60 bg-white min-h-[142px]">
          {isGeneratingImage ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="mt-2 text-xs font-medium text-primary">Generating image…</span>
            </div>
          ) : null}

          {scene.image_url && !isEditingImagePrompt ? (
            <div className="relative group h-full min-h-[142px]">
              <Image
                src={scene.image_url!}
                alt={`Scene ${scene.id} start image`}
                fill
                className="object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => setLightboxImage(scene.image_url!)}
                unoptimized
              />
              <button
                type="button"
                onClick={() => setEditingImagePrompt((prev) => ({ ...prev, [scene.id]: true }))}
                className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
                title="Edit Prompt"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Start Image Prompt
                </span>
                {scene.image_url && (
                  <button
                    type="button"
                    onClick={() => setEditingImagePrompt((prev) => ({ ...prev, [scene.id]: false }))}
                    className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                )}
              </div>
              <Textarea
                value={scene.image_prompt}
                onChange={(e) => updateScene(scene.id, "image_prompt", e.target.value)}
                placeholder="Describe the starting frame..."
                className="min-h-[60px] text-xs resize-none border-dashed"
              />

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Main Ref
                  </label>
                  <select
                    value={references.find((r) => r.image_url === scene.main_reference)?.id || ""}
                    onChange={(e) => {
                      const ref = references.find((r) => r.id === e.target.value);
                      setScenes((prev) =>
                        prev.map((s) => (s.id === scene.id ? { ...s, main_reference: ref?.image_url } : s))
                      );
                    }}
                    className="w-full text-xs h-7 rounded border border-border bg-white px-1"
                  >
                    <option value="">None</option>
                    {references.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Sec Ref
                  </label>
                  <select
                    value={references.find((r) => r.image_url === scene.secondary_reference)?.id || ""}
                    onChange={(e) => {
                      const ref = references.find((r) => r.id === e.target.value);
                      setScenes((prev) =>
                        prev.map((s) => (s.id === scene.id ? { ...s, secondary_reference: ref?.image_url } : s))
                      );
                    }}
                    className="w-full text-xs h-7 rounded border border-border bg-white px-1"
                  >
                    <option value="">None</option>
                    {references.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                className="h-8 w-full text-xs"
                onClick={() =>
                  handleGenerateSceneImage(
                    scene.id,
                    scene.image_prompt,
                    scene.main_reference,
                    scene.secondary_reference
                  )
                }
                disabled={!scene.image_prompt.trim()}
              >
                <Video className="mr-2 h-3.5 w-3.5" />
                {scene.image_url ? "Regenerate" : "Generate Image"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="relative space-y-2 md:px-4 md:py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground md:hidden">
          Audio
        </p>

        <div className="relative overflow-hidden rounded-xl border border-border/60 bg-white min-h-[142px]">
          {isGeneratingAudio ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="mt-2 text-xs font-medium text-primary">Generating audio…</span>
            </div>
          ) : null}

          {scene.audio_url && !isEditingAudioPrompt ? (
            <div className="relative group p-3 h-full min-h-[142px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  <span>Actual Audio</span>
                  <span>Generated</span>
                </div>
                <p className="mt-2 text-xs text-foreground line-clamp-3">{scene.speech}</p>
              </div>

              <div className="mt-2">
                <audio key={scene.audio_url} controls src={scene.audio_url} className="h-8 w-full" />
              </div>

              <button
                type="button"
                onClick={() => setEditingAudioPrompt((prev) => ({ ...prev, [scene.id]: true }))}
                className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
                title="Edit Script"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Audio Script
                </span>
                {scene.audio_url && (
                  <button
                    type="button"
                    onClick={() => setEditingAudioPrompt((prev) => ({ ...prev, [scene.id]: false }))}
                    className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                )}
              </div>
              <Textarea
                value={scene.speech}
                onChange={(e) => updateScene(scene.id, "speech", e.target.value)}
                placeholder="What should be said in this scene?"
                className="min-h-[60px] text-xs resize-none border-dashed"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 w-full text-xs border-primary/30 text-primary hover:bg-primary/5"
                onClick={() => handleGenerateSceneAudio(scene.id, scene.speech)}
                disabled={!scene.speech.trim()}
              >
                <Music2 className="mr-2 h-3.5 w-3.5" />
                {scene.audio_url ? "Regenerate Audio" : "Generate Audio"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
