"use client";

import { Timeline, type TimelineState } from "@xzdarcy/react-timeline-editor";
import type { TimelineAction, TimelineRow } from "@xzdarcy/timeline-engine";
import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";

const FLOAT_TOLERANCE = 0.01;

export type StoryboardTimelineClip = {
  id: string;
  sceneId: number;
  title: string;
  start: number;
  end: number;
  color: string;
};

type StoryboardTimelineProps = {
  clips: StoryboardTimelineClip[];
  currentTime: number;
  isPlaying: boolean;
  minClipDuration: number;
  onCurrentTimeChange: (time: number) => void;
  onIsPlayingChange: (isPlaying: boolean) => void;
  onClipsChange: (clips: StoryboardTimelineClip[]) => void;
};

const formatTimelineTime = (seconds: number) => {
  const clamped = Math.max(0, seconds);
  const minutes = Math.floor(clamped / 60);
  const remainder = (clamped % 60).toFixed(1).padStart(4, "0");
  return `${minutes}:${remainder}`;
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
    if (!timelineApi) {
      return;
    }

    const handleTimeChange = ({ time }: { time: number }) => {
      onCurrentTimeChange(time);
    };
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
    if (!timelineApi) {
      return;
    }

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
        .sort((firstAction, secondAction) => firstAction.start - secondAction.start || firstAction.end - secondAction.end)
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
    if (!timelineApi || totalDuration <= 0) {
      return;
    }

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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Video Timeline</div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            {formatTimelineTime(currentTime)} / {formatTimelineTime(totalDuration)}
          </span>
          <span>{isPlaying ? "Playing" : "Paused"}</span>
        </div>
      </div>

      <div className="rounded-lg border border-border/70">
        <Timeline
          ref={timelineApiRef}
          editorData={editorData}
          effects={effects}
          scale={1}
          scaleSplitCount={2}
          scaleWidth={130}
          startLeft={20}
          rowHeight={56}
          minScaleCount={Math.max(20, Math.ceil(totalDuration))}
          maxScaleCount={Math.max(80, Math.ceil(totalDuration) + 20)}
          gridSnap
          dragLine
          autoScroll
          style={{ width: "100%", height: 248 }}
          onChange={handleTimelineChange}
          onCursorDrag={onCurrentTimeChange}
          onCursorDragEnd={onCurrentTimeChange}
          onClickTimeArea={(time) => {
            onCurrentTimeChange(time);
            return true;
          }}
          onClickAction={handleClickAction}
          getActionRender={(action) => {
            const clip = clipMap.get(action.id);
            return (
              <div
                className="h-full w-full overflow-hidden rounded-md border border-white/35 px-2 py-1 text-[11px] text-white"
                style={{ backgroundColor: clip?.color ?? "#1f80db" }}
              >
                <p className="truncate font-semibold">{clip?.title ?? action.id}</p>
                <p className="opacity-90">{formatTimelineTime(action.end - action.start)}</p>
              </div>
            );
          }}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">Drag to reorder, resize clip edges to trim. Snap: 0.5s, min: 1.0s.</p>
        <Button type="button" variant="outline" size="sm" onClick={togglePlayback}>
          {isPlaying ? <Pause className="mr-1.5 h-3.5 w-3.5" /> : <Play className="mr-1.5 h-3.5 w-3.5" />}
          {isPlaying ? "Pause" : "Play"}
        </Button>
      </div>
    </div>
  );
}
