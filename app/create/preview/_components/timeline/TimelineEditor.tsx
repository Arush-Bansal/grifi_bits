"use client";

import { Timeline, type TimelineState } from "@xzdarcy/react-timeline-editor";
import "@xzdarcy/react-timeline-editor/dist/react-timeline-editor.css";
import type { TimelineAction, TimelineRow } from "@xzdarcy/timeline-engine";
import { forwardRef, type MouseEvent } from "react";
import { formatTimelineTime } from "../../../_utils";
import { StoryboardTimelineClip } from "../../../types";

type TimelineEditorProps = {
  editorData: TimelineRow[];
  effects: Record<string, { id: string; name: string }>;
  totalDuration: number;
  clipMap: Map<string, StoryboardTimelineClip>;
  onCurrentTimeChange: (time: number) => void;
  onTimelineChange: (rows: TimelineRow[]) => void;
  onClickAction: (e: MouseEvent<HTMLElement>, params: { action: TimelineAction; time: number }) => void;
};

export const TimelineEditor = forwardRef<TimelineState, TimelineEditorProps>(
  ({ editorData, effects, totalDuration, clipMap, onCurrentTimeChange, onTimelineChange, onClickAction }, ref) => {
    return (
      <div className="rounded-lg border border-border/70">
        <Timeline
          ref={ref}
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
          onChange={onTimelineChange}
          onCursorDrag={onCurrentTimeChange}
          onCursorDragEnd={onCurrentTimeChange}
          onClickTimeArea={(time) => {
            onCurrentTimeChange(time);
            return true;
          }}
          onClickAction={onClickAction}
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
    );
  }
);

TimelineEditor.displayName = "TimelineEditor";
