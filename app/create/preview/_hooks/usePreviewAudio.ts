"use client";

import { useEffect, useRef } from "react";
import { Scene, VideoSettings } from "@/app/create/types";

import { StoryboardTimelineClip } from "@/app/create/types";

interface UsePreviewAudioProps {
  timelineIsPlaying: boolean;
  timelineCurrentTime: number;
  activeTimelineClip: StoryboardTimelineClip | null;
  scenes: Scene[];
  settings: VideoSettings;
}

export function usePreviewAudio({
  timelineIsPlaying,
  timelineCurrentTime,
  activeTimelineClip,
  scenes,
  settings,
}: UsePreviewAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const lastAudioSrc = useRef<string | null>(null);
  const lastBgAudioSrc = useRef<string | null>(null);

  // Scene Audio Playback logic
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const activeScene = activeTimelineClip ? scenes.find((s) => s.id === activeTimelineClip.sceneId) : null;
    const audioUrl = activeScene?.audio_url;
    const hasVideo = !!activeScene?.video_url;

    if (timelineIsPlaying && audioUrl && !hasVideo) {
      if (lastAudioSrc.current !== audioUrl) {
        audio.src = audioUrl;
        lastAudioSrc.current = audioUrl;
        audio.load();
      }
      
      const sceneRelativeTime = timelineCurrentTime - (activeTimelineClip?.start || 0);
      
      if (Math.abs(audio.currentTime - sceneRelativeTime) > 0.2) {
        audio.currentTime = sceneRelativeTime;
      }
      
      if (audio.paused) {
        audio.play().catch(e => {
          if (e.name !== "AbortError") {
            console.error("Audio play failed:", e);
          }
        });
      }
    } else {
      if (!audio.paused) {
        audio.pause();
      }
    }
  }, [timelineIsPlaying, timelineCurrentTime, activeTimelineClip, scenes]);

  // Background Audio Playback logic
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

  return { audioRef, bgAudioRef };
}
