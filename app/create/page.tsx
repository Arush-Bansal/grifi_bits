"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Music2, Pencil, Subtitles, UploadCloud, Video } from "lucide-react";
import "@xzdarcy/react-timeline-editor/dist/react-timeline-editor.css";
import StoryboardTimeline, { type StoryboardTimelineClip } from "@/components/timeline/storyboard-timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type Step = 0 | 1 | 2 | 3;

type Scene = {
  id: number;
  name: string;
  imagePrompt: string;
  audioPrompt: string;
  imagePreview?: string;
  videoUrl?: string;
  audioUrl?: string;
};

type ReferenceCard = {
  id: string;
  label: string;
  tagline: string;
  image: string;
};

const previousStepMap: Record<Step, Step> = {
  0: 0,
  1: 0,
  2: 1,
  3: 2
};

const nextStepMap: Record<Step, Step> = {
  0: 1,
  1: 2,
  2: 3,
  3: 3
};

const defaultReferences: ReferenceCard[] = [
  {
    id: "girl",
    label: "Girl",
    tagline: "Authentic UGC speaker",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: "box",
    label: "Box",
    tagline: "Clean unboxing frame",
    image:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: "brand",
    label: "Brand",
    tagline: "Branded color + logo focus",
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    tagline: "Daily use natural scene",
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80"
  }
];

const defaultScenes: Scene[] = [
  { id: 1, name: "Hook", imagePrompt: "Close up product + surprised face", audioPrompt: "I did not expect this to work" },
  { id: 2, name: "Problem", imagePrompt: "Messy desk before use", audioPrompt: "My old setup was wasting time every day" },
  { id: 3, name: "Discovery", imagePrompt: "User discovering product online", audioPrompt: "Then I found this simple fix" },
  { id: 4, name: "Unbox", imagePrompt: "Hands opening package cleanly", audioPrompt: "Everything looked premium from the box" },
  { id: 5, name: "Demo", imagePrompt: "Use product in bright natural room", audioPrompt: "Watch how fast this takes effect" },
  { id: 6, name: "Result", imagePrompt: "Before/after split scene", audioPrompt: "You can see the difference right away" },
  { id: 7, name: "Social Proof", imagePrompt: "Overlay positive ratings", audioPrompt: "Thousands already switched to this" },
  { id: 8, name: "CTA", imagePrompt: "Product hero with brand color splash", audioPrompt: "Tap below and try it now" }
];

const TIMELINE_DEFAULT_DURATION_SECONDS = 3;
const TIMELINE_MIN_DURATION_SECONDS = 1;
const TIMELINE_SNAP_SECONDS = 0.5;
const TIMELINE_FLOAT_TOLERANCE = 0.001;
const timelineClipPalette = ["#1f80db", "#2a8dec", "#4c9ae9", "#3e86cf", "#4f88b8", "#2f7aba", "#2374c4", "#4e97da"];

const formatTimelineTime = (seconds: number) => {
  const clamped = Math.max(0, seconds);
  const minutes = Math.floor(clamped / 60);
  const remainder = (clamped % 60).toFixed(1).padStart(4, "0");
  return `${minutes}:${remainder}`;
};

const roundToTimelineSnap = (seconds: number) => Math.round(seconds / TIMELINE_SNAP_SECONDS) * TIMELINE_SNAP_SECONDS;

const sanitizeTimelineDuration = (seconds: number) =>
  Number(Math.max(TIMELINE_MIN_DURATION_SECONDS, roundToTimelineSnap(seconds)).toFixed(2));

const buildInitialTimelineClips = (sourceScenes: Scene[]): StoryboardTimelineClip[] => {
  let cursor = 0;

  return sourceScenes.map((scene, index) => {
    const duration = TIMELINE_DEFAULT_DURATION_SECONDS;
    const start = Number(cursor.toFixed(2));
    const end = Number((start + duration).toFixed(2));
    cursor = end;

    return {
      id: `scene-${scene.id}`,
      sceneId: scene.id,
      title: scene.name,
      start,
      end,
      color: timelineClipPalette[index % timelineClipPalette.length]
    };
  });
};

const normalizeTimelineClips = (clips: StoryboardTimelineClip[]): StoryboardTimelineClip[] => {
  const ordered = [...clips].sort((firstClip, secondClip) => firstClip.start - secondClip.start || firstClip.end - secondClip.end);
  let cursor = 0;

  return ordered.map((clip) => {
    const duration = sanitizeTimelineDuration(clip.end - clip.start);
    const start = Number(cursor.toFixed(2));
    const end = Number((start + duration).toFixed(2));
    cursor = end;

    return { ...clip, start, end };
  });
};

export default function CreatePage() {
  const [step, setStep] = useState<Step>(0);
  const [productName, setProductName] = useState("");
  const [productLink, setProductLink] = useState("");
  const [fetchedProductLinks, setFetchedProductLinks] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [references, setReferences] = useState(defaultReferences);
  const [customReferenceCount, setCustomReferenceCount] = useState(1);
  const [scenes, setScenes] = useState(defaultScenes);
  const [timelineClips, setTimelineClips] = useState<StoryboardTimelineClip[]>(() => buildInitialTimelineClips(defaultScenes));
  const [timelineCurrentTime, setTimelineCurrentTime] = useState(0);
  const [timelineIsPlaying, setTimelineIsPlaying] = useState(false);
  const [captions, setCaptions] = useState(true);
  const [music, setMusic] = useState("ambient-glow");
  const [saving, setSaving] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [linkFeedback, setLinkFeedback] = useState("Paste a website, Amazon, or product page URL, then click Fetch.");
  const referenceObjectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    const nextUrls = imageFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(nextUrls);

    return () => {
      nextUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);

  useEffect(() => {
    const currentRefs = referenceObjectUrlsRef.current;
    return () => {
      currentRefs.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const stepTitle = ["Product Setup", "Reference Style", "Scenes", "Final Preview"][step];
  const timelineTotalDuration = useMemo(
    () => timelineClips.reduce((maxValue, clip) => Math.max(maxValue, clip.end), 0),
    [timelineClips]
  );
  const activeTimelineClip = useMemo(
    () =>
      timelineClips.find(
        (clip, index) =>
          timelineCurrentTime >= clip.start &&
          (timelineCurrentTime < clip.end ||
            (index === timelineClips.length - 1 && timelineCurrentTime <= clip.end + TIMELINE_FLOAT_TOLERANCE))
      ) ?? null,
    [timelineClips, timelineCurrentTime]
  );

  useEffect(() => {
    setTimelineCurrentTime((prev) => Math.min(prev, timelineTotalDuration));
  }, [timelineTotalDuration]);

  const updateScene = (sceneId: number, key: "imagePrompt" | "audioPrompt", value: string) => {
    setScenes((prev) => prev.map((scene) => (scene.id === sceneId ? { ...scene, [key]: value } : scene)));
  };

  const handleTimelineClipsChange = (nextClips: StoryboardTimelineClip[]) => {
    setTimelineClips(normalizeTimelineClips(nextClips));
  };

  const handleTimelineTimeChange = (nextTime: number) => {
    const bounded = Number(Math.max(0, Math.min(nextTime, timelineTotalDuration)).toFixed(2));
    setTimelineCurrentTime(bounded);
  };

  const handleFileInput = (files: FileList | null) => {
    if (!files) {
      return;
    }
    setImageFiles(Array.from(files).slice(0, 8));
  };

  const updateReferenceImage = (referenceId: string, files: FileList | null) => {
    const nextFile = files?.[0];
    if (!nextFile) {
      return;
    }

    const nextImageUrl = URL.createObjectURL(nextFile);
    referenceObjectUrlsRef.current.push(nextImageUrl);

    setReferences((prev) =>
      prev.map((reference) => (reference.id === referenceId ? { ...reference, image: nextImageUrl } : reference))
    );
  };

  const updateReferenceLimit = (id: string, key: "label" | "tagline", value: string) => {
    setReferences((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: value } : r))
    );
  };

  const addReferenceCard = (files: FileList | null) => {
    const nextFile = files?.[0];
    if (!nextFile) {
      return;
    }

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
  };

  const fetchLinkMutation = useMutation({
    mutationFn: async (url: string) => {
      const { data } = await axios.post("/api/fetch-link", { url });
      return data;
    },
    onSuccess: (data, url) => {
      setProductName(data.title || productName);
      setDescription((prev) => (data.description ? `${prev}\n\n${data.description}` : prev));
      setFetchedProductLinks((prev) => [...new Set([...prev, url])]);
      setLinkFeedback(`Fetched info for ${data.title}.`);
      setProductLink("");
    },
    onError: (error: Error) => {
      const axiosError = error as { response?: { data?: { error?: string } } };
      const message = axiosError.response?.data?.error || error.message || "Failed to fetch link.";
      setLinkFeedback(message);
    }
  });

  const handleFetchLink = () => {
    const trimmed = productLink.trim();

    if (!trimmed) {
      setLinkFeedback("Add a product page URL to fetch product info.");
      return;
    }

    const normalizedLink =
      trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`;
    
    try {
      new URL(normalizedLink);
    } catch {
      setLinkFeedback("Please enter a valid URL.");
      return;
    }

    if (fetchedProductLinks.includes(normalizedLink)) {
      setLinkFeedback("This product URL is already fetched.");
      return;
    }

    fetchLinkMutation.mutate(normalizedLink);
  };

  const orchestrateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post("/api/orchestrate", {
        productName,
        description,
        imageNames: imageFiles.map((f) => f.name)
      });
      return data;
    },
    onSuccess: (data) => {
      // Map generated references to existing state
      const nextReferences = Object.entries(data.REFERENCE_SPECS).map(([key, prompt], index) => ({
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        tagline: prompt as string,
        image: defaultReferences[index % defaultReferences.length].image // Use default images for now
      }));
      setReferences(nextReferences);

      // Map generated scenes
      const nextScenes = data.SCENES.map((scene: { name: string; image_prompt: string; speech: string }, index: number) => ({
        id: index + 1,
        name: scene.name,
        imagePrompt: scene.image_prompt,
        audioPrompt: scene.speech
      }));
      setScenes(nextScenes);
      setTimelineClips(buildInitialTimelineClips(nextScenes));
      
      setStep(1); // Advance to references
    },
    onError: (error: Error) => {
      const axiosError = error as { response?: { data?: { error?: string } } };
      alert(axiosError.response?.data?.error || "Failed to generate plan.");
    }
  });

  const generateMediaMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post("/api/generate-media", {
        scenes,
        references: Object.fromEntries(references.map((r) => [r.id, r.tagline])),
        voiceId: process.env.ELEVEN_LABS_VOICE_ID
      });
      return data;
    },
    onSuccess: (data) => {
      // Update scenes with generated URLs
      setScenes((prev) => prev.map((scene) => {
        const result = data.sceneResults.find((r: any) => r.id === scene.id);
        if (result) {
          return {
            ...scene,
            imagePreview: result.imageUrl,
            videoUrl: result.videoUrl,
            audioUrl: result.audioUrl
          };
        }
        return scene;
      }));
      alert("Media generation complete!");
    },
    onError: (error: Error) => {
      const axiosError = error as any;
      alert(axiosError.response?.data?.error || "Failed to generate media.");
    }
  });

  const saveProject = async () => {
    setSaving(true);
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          description,
          imageNames: imageFiles.map((file) => file.name),
          selectedReference: null,
          scenes,
          captions,
          music
        })
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <section className="">
        <div className=" flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Build Flow</p>
            <h1 className="mt-2 text-3xl font-bold">{stepTitle}</h1>
          </div>
          <div className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm text-muted-foreground">Step {step + 1} of 4</div>
        </div>

        <div className="mb-7 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((step + 1) / 4) * 100}%` }} />
        </div>

        {step === 0 && (
          <div className="grid gap-7 lg:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="product-name">Product name *</Label>
                <Input
                  id="product-name"
                  placeholder="HydraGlow Face Mist"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Describe your product *</Label>
                <Textarea
                  id="description"
                  placeholder="Give details: audience, offer, tone, outcomes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[160px]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-link">Fetch product info (optional)</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="product-link"
                    value={productLink}
                    onChange={(e) => setProductLink(e.target.value)}
                    placeholder="Paste website, Amazon, or product page URL"
                    className="sm:flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleFetchLink} 
                    className="sm:min-w-28"
                    disabled={fetchLinkMutation.isPending}
                  >
                    {fetchLinkMutation.isPending ? "Fetching..." : "Fetch"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{linkFeedback}</p>
                {fetchedProductLinks.length > 0 && (
                  <div className="rounded-lg border border-border/70 bg-background/70 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Fetched sources ({fetchedProductLinks.length}) - you can add more
                    </p>
                    <ul className="mt-2 space-y-1">
                      {fetchedProductLinks.map((link, index) => (
                        <li key={`${link}-${index}`} className="truncate text-xs text-foreground">
                          {index + 1}. {link}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-dashed border-primary/40 bg-secondary/30 p-5">
                <Label htmlFor="images" className="mb-2 block">
                  Upload product images
                </Label>
                <label
                  htmlFor="images"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-background/80 px-4 py-3 text-sm text-muted-foreground"
                >
                  <UploadCloud className="h-4 w-4" />
                  Select up to 8 images
                </label>
                <Input id="images" type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileInput(e.target.files)} />
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-[#dff2ff] to-[#eff7ff] p-5">
              <h2 className="text-base font-semibold">Creative Brief Snapshot</h2>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">* Required fields</p>
              <p className="mt-2 text-sm text-muted-foreground">Your brief will feed the script, scene prompts, and voice style in the next steps.</p>
              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Brand:</span> {productName || "Not set"}
                </p>
                <p>
                  <span className="font-semibold">Assets:</span> {imageFiles.length} uploaded
                </p>
                <p>
                  <span className="font-semibold">Tone:</span> UGC conversion focused
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="mb-5 max-w-2xl text-sm text-muted-foreground">
              These references are all used in the next step. Edit any image or upload additional references.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {references.map((reference) => {
                return (
                  <article
                    key={reference.id}
                    className={cn("overflow-hidden rounded-2xl border border-border bg-white/90 transition-all hover:border-primary/50")}
                  >
                    <div className="group block w-full text-left">
                      <div className="relative h-44 w-full">
                        <Image src={reference.image} alt={reference.label} fill className="object-cover transition group-hover:scale-105" unoptimized />
                      </div>
                      <div className="bg-white/90 p-4">
                        <Input
                          value={reference.label}
                          onChange={(e) => updateReferenceLimit(reference.id, "label", e.target.value)}
                          className="h-7 border-none bg-transparent p-0 text-sm font-semibold text-foreground focus-visible:ring-0"
                        />
                        <Input
                          value={reference.tagline}
                          onChange={(e) => updateReferenceLimit(reference.id, "tagline", e.target.value)}
                          className="mt-1 h-6 border-none bg-transparent p-0 text-xs text-muted-foreground focus-visible:ring-0"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 border-t border-border/70 bg-white/90 p-3">
                      <label htmlFor={`reference-image-${reference.id}`} className="inline-flex cursor-pointer items-center gap-1 text-xs text-primary">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </label>
                      <span className="text-xs text-muted-foreground">|</span>
                      <label htmlFor={`reference-upload-${reference.id}`} className="inline-flex cursor-pointer items-center gap-1 text-xs text-primary">
                        <UploadCloud className="h-3.5 w-3.5" />
                        Upload image
                      </label>
                      <Input
                        id={`reference-image-${reference.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          updateReferenceImage(reference.id, e.target.files);
                          e.target.value = "";
                        }}
                      />
                      <Input
                        id={`reference-upload-${reference.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          addReferenceCard(e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </div>
                  </article>
                );
              })}
              <article className="overflow-hidden rounded-2xl border border-dashed border-primary/40 bg-white/60">
                <label htmlFor="add-reference-image" className="flex min-h-[278px] cursor-pointer flex-col items-center justify-center gap-2 p-4 text-center">
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
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-5 text-sm text-muted-foreground">
              Each row is one scene with editable prompts and read-only mock previews for start image and audio.
            </p>
            <div className="mesh-bg overflow-x-auto rounded-2xl border border-border/70 bg-background/70">
              <div className="min-w-[1520px]">
                <div className="hidden grid-cols-[180px_minmax(320px,1fr)_240px_minmax(320px,1fr)_240px] border-b border-border/70 bg-secondary/40 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground md:grid">
                  <p className="border-r border-border/60 px-4 py-3">Scene</p>
                  <p className="border-r border-border/60 px-4 py-3">Start Image Prompt</p>
                  <p className="border-r border-border/60 px-4 py-3">Start Image Preview</p>
                  <p className="border-r border-border/60 px-4 py-3">Audio Script</p>
                  <p className="px-4 py-3">Audio Preview</p>
                </div>

                {scenes.map((scene, index) => {
                  const trimmedAudio = scene.audioPrompt.trim();
                  const audioPreviewText =
                    trimmedAudio.length > 90 ? `${trimmedAudio.slice(0, 90)}...` : trimmedAudio || "No script yet";

                  return (
                    <article
                      key={scene.id}
                      className="grid gap-4 border-b border-border/60 bg-white/75 p-4 last:border-b-0 md:grid-cols-[180px_minmax(320px,1fr)_240px_minmax(320px,1fr)_240px] md:gap-0 md:p-0"
                    >
                      <div className="md:border-r md:border-border/60 md:px-4 md:py-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-primary">Scene {scene.id}</p>
                        <h3 className="mt-1 text-lg font-semibold">{scene.name}</h3>
                      </div>

                      <div className="space-y-2 md:border-r md:border-border/60 md:px-4 md:py-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground md:hidden">Start Image Prompt</p>
                          <button type="button" className="inline-flex items-center gap-1 text-xs text-primary">
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                        </div>
                        <Textarea
                          value={scene.imagePrompt}
                          onChange={(e) => updateScene(scene.id, "imagePrompt", e.target.value)}
                          className="min-h-[92px] bg-white"
                        />
                      </div>

                      <div className="space-y-2 md:border-r md:border-border/60 md:px-4 md:py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground md:hidden">Start Image Preview</p>
                        <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
                          {scene.imagePreview ? (
                            <div className="relative h-[110px] w-full">
                              <Image src={scene.imagePreview} alt={`Scene ${scene.id} start image preview`} fill className="object-cover" unoptimized />
                            </div>
                          ) : (
                            <div className="flex h-[110px] items-center justify-center bg-muted/40 px-3 text-center text-xs text-muted-foreground">
                              {generateMediaMutation.isPending ? "Generating..." : "Generate media to see preview"}
                            </div>
                          )}
                          <div className="flex items-center justify-between border-t border-border/60 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                            <span>{scene.imagePreview ? "Actual Generation" : "No asset"}</span>
                            <span>{scene.imagePreview ? "Live" : "Ready"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 md:border-r md:border-border/60 md:px-4 md:py-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground md:hidden">Audio Script</p>
                          <button type="button" className="inline-flex items-center gap-1 text-xs text-primary">
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                        </div>
                        <Textarea
                          value={scene.audioPrompt}
                          onChange={(e) => updateScene(scene.id, "audioPrompt", e.target.value)}
                          className="min-h-[92px] bg-white"
                        />
                      </div>

                      <div className="space-y-2 md:px-4 md:py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground md:hidden">Audio Preview</p>
                        <div className="rounded-xl border border-border/60 bg-white p-3">
                          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                            <span>{scene.audioUrl ? "Actual Audio" : "No Audio"}</span>
                            <span>{scene.audioUrl ? "Generated" : "Pending"}</span>
                          </div>
                          <p className="mt-2 text-sm text-foreground">{audioPreviewText}</p>
                          {scene.audioUrl && (
                             <audio controls className="mt-2 h-8 w-full">
                               <source src={scene.audioUrl} type="audio/mpeg" />
                             </audio>
                          )}
                          <div className="mt-3 grid grid-cols-6 items-end gap-1">
                            {[35, 58, 42, 70, 50, 66].map((height, barIndex) => (
                              <div key={`${scene.id}-audio-bar-${barIndex}`} className="rounded-sm bg-primary/55" style={{ height: `${height}%` }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-6 lg:grid-cols-[minmax(280px,420px)_1fr]">
            <div className="rounded-2xl border border-border bg-white/90 p-4">
              <p className="mb-3 text-sm font-semibold text-foreground">Video Preview (Portrait)</p>
              <div className="relative mx-auto aspect-[9/16] max-h-[620px] overflow-hidden rounded-2xl bg-gradient-to-b from-[#89c9ff] to-[#3f98eb]">
                {activeTimelineClip?.sceneId && scenes.find(s => s.id === activeTimelineClip.sceneId)?.videoUrl ? (
                   <video 
                     src={scenes.find(s => s.id === activeTimelineClip.sceneId)?.videoUrl} 
                     controls 
                     className="absolute inset-0 w-full h-full object-cover"
                   />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_45%)]" />
                    <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
                      {generateMediaMutation.isPending ? "Generating your video masterpiece..." : "Generate media to see the video preview"}
                    </div>
                  </>
                )}
                <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-black/30 px-3 py-2 text-xs text-white">
                  {captions ? "Caption preview enabled" : "Captions disabled"}
                </div>
                <div className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-primary">
                  {productName || "Your Brand"}
                </div>
              </div>
              <div className="mt-3 rounded-xl border border-border/70 bg-secondary/40 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Active Clip</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {activeTimelineClip ? `Scene ${activeTimelineClip.sceneId}: ${activeTimelineClip.title}` : "No clip selected"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Playhead {formatTimelineTime(timelineCurrentTime)} / {formatTimelineTime(timelineTotalDuration)}
                </p>
              </div>
              <Button 
                onClick={() => generateMediaMutation.mutate()} 
                disabled={generateMediaMutation.isPending}
                className="mt-4 w-full"
              >
                {generateMediaMutation.isPending ? "Generating Media..." : "Generate Final Media"}
              </Button>
            </div>

            <div className="space-y-4 rounded-2xl border border-border bg-white/85 p-5">
              <h2 className="text-xl font-semibold">Final Controls</h2>

              <div className="rounded-xl bg-secondary/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Captions</p>
                    <p className="text-xs text-muted-foreground">Auto animate subtitle tracks</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCaptions((prev) => !prev)}
                    className={cn(
                      "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
                      captions ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
                        captions ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <Subtitles className="h-3.5 w-3.5" /> Burned-in UGC style captions
                </div>
              </div>

              <div className="rounded-xl bg-secondary/50 p-4">
                <Label htmlFor="music">Music</Label>
                <div className="mt-2 flex items-center gap-3">
                  <Music2 className="h-4 w-4 text-primary" />
                  <select
                    id="music"
                    value={music}
                    onChange={(e) => setMusic(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="ambient-glow">Ambient Glow</option>
                    <option value="tension-pop">Tension Pop</option>
                    <option value="clean-corporate">Clean Corporate</option>
                    <option value="hyper-ugc">Hyper UGC</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl bg-secondary/50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Video className="h-4 w-4 text-primary" /> Render Setup
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Resolution: 1080x1920, format: MP4, length: 25-35 sec</p>
              </div>

              <div className="rounded-xl bg-secondary/50 p-4">
                <StoryboardTimeline
                  clips={timelineClips}
                  currentTime={timelineCurrentTime}
                  isPlaying={timelineIsPlaying}
                  minClipDuration={TIMELINE_MIN_DURATION_SECONDS}
                  onCurrentTimeChange={handleTimelineTimeChange}
                  onIsPlayingChange={setTimelineIsPlaying}
                  onClipsChange={handleTimelineClipsChange}
                />
              </div>

              <Button onClick={saveProject} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Project"}
              </Button>
            </div>
          </div>
        )}

        {step === 0 && previewUrls.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold">Uploaded images</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {previewUrls.map((url, index) => (
                <div key={`${imageFiles[index]?.name ?? "image"}-${index}`} className="relative h-28 overflow-hidden rounded-lg border border-border">
                  <Image src={url} alt={imageFiles[index]?.name ?? `upload-${index + 1}`} fill className="object-cover" unoptimized />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button variant="outline" onClick={() => setStep((prev) => previousStepMap[prev])} disabled={step === 0}>
            Back
          </Button>
          <Button
            onClick={() => {
              if (step === 0) {
                orchestrateMutation.mutate();
              } else {
                setStep((prev) => nextStepMap[prev]);
              }
            }}
            disabled={(step === 0 && (!productName || !description || orchestrateMutation.isPending)) || step === 3}
          >
            {step === 0 ? (orchestrateMutation.isPending ? "Generating Plan..." : "Generate AI Plan") : "Next"}
          </Button>
        </div>
      </section>
    </main>
  );
}
