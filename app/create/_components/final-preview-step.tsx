"use client";

import StoryboardTimeline, { StoryboardTimelineClip } from "@/components/timeline/storyboard-timeline";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Music2, Subtitles, Video } from "lucide-react";
import Image from "next/image";
import { Scene, VideoSettings } from "../types";
import { useEffect, useRef } from "react";

interface FinalPreviewStepProps {
  activeTimelineClip: StoryboardTimelineClip | null;
  scenes: Scene[];
  generateMediaLoading: boolean;
  generateMedia: () => void;
  settings: VideoSettings;
  setSettings: (val: VideoSettings | ((prev: VideoSettings) => VideoSettings)) => void;
  timelineClips: StoryboardTimelineClip[];
  timelineCurrentTime: number;
  timelineIsPlaying: boolean;
  TIMELINE_MIN_DURATION_SECONDS: number;
  handleTimelineTimeChange: (time: number) => void;
  setTimelineIsPlaying: (playing: boolean) => void;
  handleTimelineClipsChange: (clips: StoryboardTimelineClip[]) => void;
  saveProject: () => void;
  saving: boolean;
  formatTimelineTime: (seconds: number) => string;
  timelineTotalDuration: number;
}

export function FinalPreviewStep({
  activeTimelineClip,
  scenes,
  generateMediaLoading,
  generateMedia,
  settings,
  setSettings,
  timelineClips,
  timelineCurrentTime,
  timelineIsPlaying,
  TIMELINE_MIN_DURATION_SECONDS,
  handleTimelineTimeChange,
  setTimelineIsPlaying,
  handleTimelineClipsChange,
  saveProject,
  saving,
  formatTimelineTime,
  timelineTotalDuration
}: FinalPreviewStepProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastAudioSrc = useRef<string | null>(null);
  const lastBgAudioSrc = useRef<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const activeScene = activeTimelineClip ? scenes.find((s) => s.id === activeTimelineClip.sceneId) : null;
    const audioUrl = activeScene?.audio_url;
    const hasVideo = !!activeScene?.video_url;

    // We only play audio if there's no video
    if (timelineIsPlaying && audioUrl && !hasVideo) {
      // 1. Handle Source Changes
      if (lastAudioSrc.current !== audioUrl) {
        audio.src = audioUrl;
        lastAudioSrc.current = audioUrl;
        audio.load();
      }
      
      const sceneRelativeTime = timelineCurrentTime - (activeTimelineClip?.start || 0);
      
      // 2. Sync Time (be lenient with threshold)
      if (Math.abs(audio.currentTime - sceneRelativeTime) > 0.2) {
        audio.currentTime = sceneRelativeTime;
      }
      
      // 3. Ensure Playback
      if (audio.paused) {
        audio.play().catch(e => {
          // Ignore interruption errors which are common when scrubbing rapidly
          if (e.name !== "AbortError") {
            console.error("Audio play failed:", e);
          }
        });
      }
    } else {
      // Stop playback if not playing, or if video is available, or no audio
      if (!audio.paused) {
        audio.pause();
      }
      // If we crossed into a video scene or stopped, reset lastAudioSrc to ensure fresh start next time
      if (!timelineIsPlaying || hasVideo || !audioUrl) {
        // We don't necessarily want to clear lastAudioSrc every frame if just paused,
        // but if we are not playing at all, it's safer.
      }
    }
  }, [timelineIsPlaying, timelineCurrentTime, activeTimelineClip, scenes]);

  // Background Music Effect
  useEffect(() => {
    const bgAudio = bgAudioRef.current;
    if (!bgAudio) return;

    const track = settings.music_track || "ambient-glow";
    if (track === "none") {
      bgAudio.pause();
      return;
    }

    const src = `/music/${track}.mp3`;
    if (lastBgAudioSrc.current !== src) {
      bgAudio.src = src;
      lastBgAudioSrc.current = src;
      bgAudio.load();
    }

    const volumeVal = settings.music_volume !== undefined ? settings.music_volume : 50;
    bgAudio.volume = Math.max(0, Math.min(100, volumeVal)) / 100;

    if (timelineIsPlaying) {
      const offset = settings.music_offset || 0;
      
      if (timelineCurrentTime < offset) {
        // We are before the offset, play silence / pause
        if (!bgAudio.paused) {
          bgAudio.pause();
        }
      } else {
        const targetTime = timelineCurrentTime - offset;
        if (Math.abs(bgAudio.currentTime - targetTime) > 0.2) {
          bgAudio.currentTime = targetTime;
        }
        if (bgAudio.paused) {
          bgAudio.play().catch(e => {
            if (e.name !== "AbortError") console.error("BG Audio play failed:", e);
          });
        }
      }
    } else {
      if (!bgAudio.paused) {
        bgAudio.pause();
      }
    }
  }, [timelineIsPlaying, timelineCurrentTime, settings.music_track, settings.music_offset, settings.music_volume]);


  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,420px)_1fr]">
      <div className="rounded-2xl border border-border bg-white/90 p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">Video Preview (Portrait)</p>
        <div className="relative mx-auto aspect-[9/16] max-h-[620px] overflow-hidden rounded-2xl bg-gradient-to-b from-[#89c9ff] to-[#3f98eb]">
          <audio ref={audioRef} className="hidden" />
          <audio ref={bgAudioRef} className="hidden" />
          {activeTimelineClip?.sceneId ? (
            (() => {
              const activeScene = scenes.find((s) => s.id === activeTimelineClip.sceneId);
              if (activeScene?.video_url) {
                return (
                  <video
                    src={activeScene.video_url}
                    controls
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                );
              }
              return (
                <div className="absolute inset-0">
                  {activeScene?.image_url ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={activeScene.image_url}
                        alt="Preview"
                        fill
                        className="object-cover opacity-40 blur-[2px]"
                      />
                      <div className="absolute inset-0 bg-black/20" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_45%)]" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-white">
                    {generateMediaLoading ? (
                      "Generating your video masterpiece..."
                    ) : (
                      <span className="font-medium drop-shadow-md">Generate media to see the video preview</span>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_45%)]" />
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-white">
                {generateMediaLoading ? "Generating your video masterpiece..." : "Generate media to see the video preview"}
              </div>
            </>
          )}
          <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-black/30 px-3 py-2 text-xs text-white">
            {settings.captions_enabled ? "Caption preview enabled" : "Captions disabled"}
          </div>
          {/* <div className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-primary">
            {productName || "Your Brand"}
          </div> */}
        </div>
        <div className="mt-3 rounded-xl border border-border/70 bg-secondary/40 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Active Clip</p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {activeTimelineClip
              ? `Scene ${activeTimelineClip.sceneId}: ${activeTimelineClip.title}`
              : "No clip selected"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Playhead {formatTimelineTime(timelineCurrentTime)} / {formatTimelineTime(timelineTotalDuration)}
          </p>
        </div>
        <Button onClick={generateMedia} disabled={generateMediaLoading} className="mt-4 w-full">
          {generateMediaLoading ? "Generating Media..." : "Generate Final Media"}
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
              onClick={() => setSettings(prev => ({ ...prev, captions_enabled: !prev.captions_enabled }))}
              className={cn(
                "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
                settings.captions_enabled ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
                  settings.captions_enabled ? "translate-x-6" : "translate-x-1"
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
          <div className="mt-2 space-y-4">
            <div className="flex items-center gap-3">
              <Music2 className="h-4 w-4 text-primary" />
              <select
                id="music"
                value={settings.music_track || "ambient-glow"}
                onChange={(e) => setSettings(prev => ({ ...prev, music_track: e.target.value }))}
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="none">None</option>
                <option value="ambient-glow">Ambient Glow</option>
                <option value="tension-pop">Tension Pop</option>
                <option value="clean-corporate">Clean Corporate</option>
                <option value="hyper-ugc">Hyper UGC</option>
              </select>
            </div>
            
            {settings.music_track !== "none" && (
              <div className="grid gap-4 pl-7 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="music-offset" className="text-xs text-muted-foreground">Offset (seconds)</Label>
                  <input
                    id="music-offset"
                    type="number"
                    min={0}
                    step={0.5}
                    value={settings.music_offset ?? 0}
                    onChange={(e) => setSettings(prev => ({ ...prev, music_offset: parseFloat(e.target.value) || 0 }))}
                    className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="music-volume" className="text-xs text-muted-foreground">
                    Volume ({settings.music_volume ?? 50}%)
                  </Label>
                  <input
                    id="music-volume"
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={settings.music_volume ?? 50}
                    onChange={(e) => setSettings(prev => ({ ...prev, music_volume: parseInt(e.target.value, 10) }))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-secondary/50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Video className="h-4 w-4 text-primary" /> Render Setup
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Resolution: 1080x1920, format: MP4, length: 25-35 sec
          </p>
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
  );
}
