"use client";

import { SceneRow } from "../../_components/scene-row";
import { Scene } from "../../types";

interface ScenesTableProps {
  projectId: string;
  scenes: Scene[];
}

export function ScenesTable({ projectId, scenes }: ScenesTableProps) {
  return (
    <div className="mesh-bg overflow-x-auto rounded-2xl border border-border/70 bg-background/70">
      <div className="w-full">
        <div className="hidden grid-cols-[140px_1fr] border-b border-border/70 bg-secondary/40 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:grid">
          <p className="border-r border-border/60 px-4 py-3">Scene</p>
          <p className="px-4 py-3">Video Script</p>
        </div>

        {scenes.map((scene) => (
          <SceneRow 
            key={scene.id} 
            projectId={projectId} 
            sceneId={scene.id} 
          />
        ))}
      </div>
    </div>
  );
}
