"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Music2, Pencil, Video } from "lucide-react";
import Image from "next/image";
import { EditingPrompt, ReferenceCard, Scene, SceneGenerating } from "../types";

interface ScenesStepProps {
  scenes: Scene[];
  setScenes: (scenes: Scene[] | ((prev: Scene[]) => Scene[])) => void;
  updateScene: (sceneId: number, key: "imagePrompt" | "audioPrompt" | "videoScript", value: string) => void;
  sceneGenerating: SceneGenerating;
  editingImagePrompt: EditingPrompt;
  setEditingImagePrompt: (val: EditingPrompt | ((prev: EditingPrompt) => EditingPrompt)) => void;
  editingAudioPrompt: EditingPrompt;
  setEditingAudioPrompt: (val: EditingPrompt | ((prev: EditingPrompt) => EditingPrompt)) => void;
  handleGenerateSceneImage: (sceneId: number, imagePrompt: string, mainRef?: string, secondaryRef?: string) => Promise<void>;
  handleGenerateSceneAudio: (sceneId: number, audioScript: string) => Promise<void>;
  handleGenerateAllImages: () => Promise<void>;
  handleGenerateAllAudios: () => Promise<void>;
  isGeneratingAllImages: boolean;
  isGeneratingAllAudios: boolean;
  setLightboxImage: (url: string | null) => void;
  references: ReferenceCard[];
}

export function ScenesStep({
  scenes,
  setScenes,
  updateScene,
  sceneGenerating,
  editingImagePrompt,
  setEditingImagePrompt,
  editingAudioPrompt,
  setEditingAudioPrompt,
  handleGenerateSceneImage,
  handleGenerateSceneAudio,
  handleGenerateAllImages,
  handleGenerateAllAudios,
  isGeneratingAllImages,
  isGeneratingAllAudios,
  setLightboxImage,
  references
}: ScenesStepProps) {
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

          {scenes.map((scene) => {
            return (
              <article
                key={scene.id}
                className="grid gap-4 border-b border-border/60 bg-white/75 p-4 last:border-b-0 md:grid-cols-[140px_1fr_1.2fr_1.2fr] md:gap-0 md:p-0"
              >
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
                    value={scene.videoScript}
                    onChange={(e) => updateScene(scene.id, "videoScript", e.target.value)}
                    className="min-h-[92px] bg-white"
                  />
                </div>

                <div className="relative space-y-2 md:border-r md:border-border/60 md:px-4 md:py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground md:hidden">
                    Start Image
                  </p>

                  <div className="relative overflow-hidden rounded-xl border border-border/60 bg-white min-h-[142px]">
                    {sceneGenerating[scene.id]?.image ? (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="mt-2 text-xs font-medium text-primary">Generating image…</span>
                      </div>
                    ) : null}

                    {scene.imagePreview && !editingImagePrompt[scene.id] ? (
                      <div className="relative group h-full min-h-[142px]">
                        <Image
                          src={scene.imagePreview}
                          alt={`Scene ${scene.id} start image`}
                          fill
                          className="object-cover cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => setLightboxImage(scene.imagePreview!)}
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
                          {scene.imagePreview && (
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
                          value={scene.imagePrompt}
                          onChange={(e) => updateScene(scene.id, "imagePrompt", e.target.value)}
                          placeholder="Describe the starting frame..."
                          className="min-h-[60px] text-xs resize-none border-dashed"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Main Ref
                            </label>
                            <select
                              value={references.find((r) => r.image === scene.mainReference)?.id || ""}
                              onChange={(e) => {
                                const ref = references.find((r) => r.id === e.target.value);
                                setScenes((prev) =>
                                  prev.map((s) => (s.id === scene.id ? { ...s, mainReference: ref?.image } : s))
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
                              value={references.find((r) => r.image === scene.secondaryReference)?.id || ""}
                              onChange={(e) => {
                                const ref = references.find((r) => r.id === e.target.value);
                                setScenes((prev) =>
                                  prev.map((s) => (s.id === scene.id ? { ...s, secondaryReference: ref?.image } : s))
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
                              scene.imagePrompt,
                              scene.mainReference,
                              scene.secondaryReference
                            )
                          }
                          disabled={!scene.imagePrompt.trim()}
                        >
                          <Video className="mr-2 h-3.5 w-3.5" />
                          {scene.imagePreview ? "Regenerate" : "Generate Image"}
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
                    {sceneGenerating[scene.id]?.audio ? (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="mt-2 text-xs font-medium text-primary">Generating audio…</span>
                      </div>
                    ) : null}

                    {scene.audioUrl && !editingAudioPrompt[scene.id] ? (
                      <div className="relative group p-3 h-full min-h-[142px] flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                            <span>Actual Audio</span>
                            <span>Generated</span>
                          </div>
                          <p className="mt-2 text-xs text-foreground line-clamp-3">{scene.audioPrompt}</p>
                        </div>

                        <div className="mt-2">
                          <audio key={scene.audioUrl} controls src={scene.audioUrl} className="h-8 w-full" />
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
                          {scene.audioUrl && (
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
                          value={scene.audioPrompt}
                          onChange={(e) => updateScene(scene.id, "audioPrompt", e.target.value)}
                          placeholder="What should be said in this scene?"
                          className="min-h-[60px] text-xs resize-none border-dashed"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 w-full text-xs border-primary/30 text-primary hover:bg-primary/5"
                          onClick={() => handleGenerateSceneAudio(scene.id, scene.audioPrompt)}
                          disabled={!scene.audioPrompt.trim()}
                        >
                          <Music2 className="mr-2 h-3.5 w-3.5" />
                          {scene.audioUrl ? "Regenerate Audio" : "Generate Audio"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
