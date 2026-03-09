import { type StoryboardTimelineClip } from "@/components/timeline/storyboard-timeline";
import { Scene } from "../types";
import {
  TIMELINE_DEFAULT_DURATION_SECONDS,
  TIMELINE_MIN_DURATION_SECONDS,
  TIMELINE_SNAP_SECONDS,
  timelineClipPalette
} from "../constants";

export const formatTimelineTime = (seconds: number) => {
  const clamped = Math.max(0, seconds);
  const minutes = Math.floor(clamped / 60);
  const remainder = (clamped % 60).toFixed(1).padStart(4, "0");
  return `${minutes}:${remainder}`;
};

export const roundToTimelineSnap = (seconds: number) => Math.round(seconds / TIMELINE_SNAP_SECONDS) * TIMELINE_SNAP_SECONDS;

export const sanitizeTimelineDuration = (seconds: number) =>
  Number(Math.max(TIMELINE_MIN_DURATION_SECONDS, roundToTimelineSnap(seconds)).toFixed(2));

export const buildInitialTimelineClips = (sourceScenes: Scene[]): StoryboardTimelineClip[] => {
  let cursor = 0;

  return sourceScenes.map((scene, index) => {
    const duration = scene.audio_duration || TIMELINE_DEFAULT_DURATION_SECONDS;
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

export const normalizeTimelineClips = (clips: StoryboardTimelineClip[]): StoryboardTimelineClip[] => {
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
