"use client";

import { type TimelineState } from "@xzdarcy/react-timeline-editor";
import type { TimelineAction, TimelineRow } from "@xzdarcy/timeline-engine";
import { useCallback, useEffect, useMemo, useRef, type MouseEvent } from "react";
import { StoryboardTimelineClip } from "../../../types";
import { TimelineHeader } from "./TimelineHeader";
import { TimelineFooter } from "./TimelineFooter";
import { TimelineEditor } from "./TimelineEditor";

const FLOAT_TOLERANCE = 0.01;

type StoryboardTimelineProps = {
  clips: StoryboardTimelineClip[];
  currentTime: number;
  isPlaying: boolean;
  minClipDuration: number;
  onCurrentTimeChange: (time: number) => void;
  onIsPlayingChange: (isPlaying: boolean) => void;
  onClipsChange: (clips: StoryboardTimelineClip[]) => void;
};

export default function StoryboardTimeline({
  clips,
  currentTime,
  isPlaying,
  minClipDuration,
  onCurrentTimeChange,
  onIsPlayingChange,
  onClipsChange
}: StoryboardTimelineProps) {
  const timelineApiRef = useRef<TimelineState | null>(null);

  const totalDuration = useMemo(() => clips.reduce((maxValue, clip) => Math.max(maxValue, clip.end), 0), [clips]);
  const clipMap = useMemo(() => new Map(clips.map((clip) => [clip.id, clip])), [clips]);

  const effects = useMemo(
    () =>
      Object.fromEntries(
        clips.map((clip) => [
          clip.id,
          {
            id: clip.id,
            name: clip.title
          }
        ])
      ),
    [clips]
  );

  const editorData = useMemo<TimelineRow[]>(
    () => [
      {
        id: "Video",
        actions: clips.map((clip) => ({
          id: clip.id,
          start: clip.start,
          end: clip.end,
          effectId: clip.id,
          movable: true,
          flexible: true
        }))
      }
    ],
    [clips]
  );

  useEffect(() => {
    const timelineApi = timelineApiRef.current;
    if (!timelineApi) return;

    const handleTimeChange = ({ time }: { time: number }) => onCurrentTimeChange(time);
    const handlePlay = () => onIsPlayingChange(true);
    const handlePause = () => onIsPlayingChange(false);
    const handleEnded = () => {
      onIsPlayingChange(false);
      onCurrentTimeChange(totalDuration);
    };

    timelineApi.listener.on("afterSetTime", handleTimeChange);
    timelineApi.listener.on("setTimeByTick", handleTimeChange);
    timelineApi.listener.on("play", handlePlay);
    timelineApi.listener.on("paused", handlePause);
    timelineApi.listener.on("ended", handleEnded);

    return () => {
      timelineApi.listener.off("afterSetTime", handleTimeChange);
      timelineApi.listener.off("setTimeByTick", handleTimeChange);
      timelineApi.listener.off("play", handlePlay);
      timelineApi.listener.off("paused", handlePause);
      timelineApi.listener.off("ended", handleEnded);
    };
  }, [onCurrentTimeChange, onIsPlayingChange, totalDuration]);

  useEffect(() => {
    const timelineApi = timelineApiRef.current;
    if (!timelineApi) return;

    const boundedTime = Math.max(0, Math.min(currentTime, totalDuration));
    const existingTime = timelineApi.getTime();
    if (Math.abs(existingTime - boundedTime) > FLOAT_TOLERANCE) {
      timelineApi.setTime(boundedTime);
    }
  }, [currentTime, totalDuration]);

  const handleTimelineChange = useCallback(
    (rows: TimelineRow[]) => {
      const nextActions = rows[0]?.actions ?? [];
      const nextClips = nextActions
        .filter((action) => clipMap.has(action.id))
        .sort((a, b) => a.start - b.start || a.end - b.end)
        .map((action) => {
          const sourceClip = clipMap.get(action.id)!;
          return {
            ...sourceClip,
            start: action.start,
            end: Math.max(action.start + minClipDuration, action.end)
          };
        });

      if (nextClips.length === clips.length) {
        onClipsChange(nextClips);
      }
    },
    [clipMap, clips.length, minClipDuration, onClipsChange]
  );

  const togglePlayback = () => {
    const timelineApi = timelineApiRef.current;
    if (!timelineApi || totalDuration <= 0) return;

    if (timelineApi.isPlaying) {
      timelineApi.pause();
      return;
    }

    if (currentTime >= totalDuration - FLOAT_TOLERANCE) {
      timelineApi.setTime(0);
    }

    timelineApi.play({
      toTime: totalDuration,
      autoEnd: true
    });
  };

  const handleClickAction = (_: MouseEvent<HTMLElement>, params: { action: TimelineAction; time: number }) => {
    onCurrentTimeChange(params.time);
  };

  return (
    <div className="storyboard-timeline overflow-hidden rounded-xl border border-border/70 bg-background/70 p-3">
      <TimelineHeader currentTime={currentTime} totalDuration={totalDuration} isPlaying={isPlaying} />
      <TimelineEditor
        ref={timelineApiRef}
        editorData={editorData}
        effects={effects}
        totalDuration={totalDuration}
        clipMap={clipMap}
        onCurrentTimeChange={onCurrentTimeChange}
        onTimelineChange={handleTimelineChange}
        onClickAction={handleClickAction}
      />
      <TimelineFooter isPlaying={isPlaying} onTogglePlayback={togglePlayback} />
    </div>
  );
}
