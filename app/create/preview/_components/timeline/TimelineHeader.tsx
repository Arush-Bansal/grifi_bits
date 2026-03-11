"use client";

import { formatTimelineTime } from "../../../_utils";

type TimelineHeaderProps = {
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
};

export function TimelineHeader({ currentTime, totalDuration, isPlaying }: TimelineHeaderProps) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Video Timeline</div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          {formatTimelineTime(currentTime)} / {formatTimelineTime(totalDuration)}
        </span>
        <span>{isPlaying ? "Playing" : "Paused"}</span>
      </div>
    </div>
  );
}
