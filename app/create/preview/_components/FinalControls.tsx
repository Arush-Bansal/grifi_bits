"use client";

import { Button } from "@/components/ui/button";
import { MusicControl } from "./music-control";
import { VideoSettings } from "../../types";
import { AIChat } from "../../_components/ai-chat";

export function FinalControls({
  settings,
  setSettings,
  onSaveProject,
  isSaving,
}: {
  settings: VideoSettings;
  setSettings: (updater: (prev: VideoSettings) => VideoSettings) => void;
  onSaveProject: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="space-y-4 rounded-2xl border border-border bg-white/85 p-5">


        <MusicControl settings={settings} setSettings={setSettings} />

        <Button 
          onClick={onSaveProject} 
          disabled={isSaving} 
          className="w-full"
        >
          {isSaving ? "Saving..." : "Save Project"}
        </Button>
      </div>

      <div className="flex-1 min-h-[350px] rounded-2xl border border-border bg-white/85 p-5 flex flex-col">
        <h2 className="text-xl font-semibold mb-4">AI Assistant</h2>
        <div className="flex-1">
          <AIChat />
        </div>
      </div>
    </div>
  );
}
