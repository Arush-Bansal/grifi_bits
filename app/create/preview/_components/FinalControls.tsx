"use client";

import { Button } from "@/components/ui/button";
import { MusicControl } from "./music-control";
import { VideoSettings } from "../../types";
import { cn } from "@/lib/utils";
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
  const templates = [
    { id: "ProductDemo", name: "Standard", desc: "Classic product showcase" },
    { id: "Minimalist", name: "Minimalist", desc: "Clean & high-end" },
    { id: "DynamicSocial", name: "Social", desc: "Fast-paced & vertical" },
    { id: "SplitScreen", name: "Split", desc: "Modern side-by-side" },
  ];

  const currentTemplate = settings.template_id || "ProductDemo";

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="space-y-4 rounded-2xl border border-border bg-white/85 p-5">
        <h2 className="text-xl font-semibold">Video Style</h2>
        
        <div className="grid grid-cols-2 gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setSettings(prev => ({ ...prev, template_id: t.id }))}
              className={cn(
                "flex flex-col items-start p-3 text-left rounded-xl border transition-all hover:border-primary/50",
                currentTemplate === t.id 
                  ? "bg-primary/5 border-primary ring-1 ring-primary" 
                  : "bg-white border-border text-muted-foreground"
              )}
            >
              <span className={cn(
                "font-semibold text-sm",
                currentTemplate === t.id ? "text-primary" : "text-foreground"
              )}>{t.name}</span>
              <span className="text-[10px] leading-tight opacity-70">{t.desc}</span>
            </button>
          ))}
        </div>

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
