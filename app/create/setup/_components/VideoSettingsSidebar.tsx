"use client";

import { Label } from "@/components/ui/label";
import { Smartphone, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoSettings } from "../../types";
import { TemplateId, TEMPLATE_IDS, TEMPLATE_METADATA } from "@/lib/template-catalog";

interface VideoSettingsSidebarProps {
  settings: VideoSettings;
  setSettings: (settings: VideoSettings) => void;
}

export function VideoSettingsSidebar({ settings, setSettings }: VideoSettingsSidebarProps) {
  const compatibleTemplates = TEMPLATE_IDS.filter(
    (templateId) => TEMPLATE_METADATA[templateId].orientation === settings.orientation
  );

  const selectTemplate = (templateId: TemplateId | "auto") => {
    if (templateId === "auto") {
      setSettings({
        ...settings,
        template_preference: "auto",
        template_id: undefined,
      });
      return;
    }

    setSettings({
      ...settings,
      template_preference: templateId,
      template_id: templateId,
    });
  };

  const updateOrientation = (orientation: "portrait" | "landscape") => {
    const currentPreference = settings.template_preference;
    const preferenceIsCompatible =
      currentPreference &&
      currentPreference !== "auto" &&
      TEMPLATE_METADATA[currentPreference].orientation === orientation;

    setSettings({
      ...settings,
      orientation,
      template_preference: preferenceIsCompatible ? currentPreference : "auto",
      template_id: preferenceIsCompatible ? currentPreference : undefined,
    });
  };

  return (
    <div className="space-y-6 rounded-[2rem] border border-border/50 bg-card/50 p-7 shadow-lg shadow-black/5 backdrop-blur-xl">
      <h2 className="text-xl font-extrabold tracking-tight text-foreground/90">Video Settings</h2>
      
      <div className="space-y-7">
        {/* Orientation */}
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Screen Orientation</Label>
          <div className="flex gap-3">
            <button
              onClick={() => updateOrientation("portrait")}
              className={cn(
                "group flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 transition-all duration-300",
                settings.orientation === "portrait"
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                  : "border-border/50 bg-background/50 hover:border-primary/30 hover:bg-primary/5"
              )}
            >
              <div className={cn(
                "rounded-lg p-2 transition-colors",
                settings.orientation === "portrait" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
              )}>
                <Smartphone className="h-5 w-5" />
              </div>
              <span className={cn(
                "text-xs font-bold tracking-tight",
                settings.orientation === "portrait" ? "text-primary" : "text-muted-foreground"
              )}>Portrait (9:16)</span>
            </button>
            <button
              onClick={() => updateOrientation("landscape")}
              className={cn(
                "group flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 transition-all duration-300",
                settings.orientation === "landscape"
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                  : "border-border/50 bg-background/50 hover:border-primary/30 hover:bg-primary/5"
              )}
            >
              <div className={cn(
                "rounded-lg p-2 transition-colors",
                settings.orientation === "landscape" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
              )}>
                <Monitor className="h-5 w-5" />
              </div>
              <span className={cn(
                "text-xs font-bold tracking-tight",
                settings.orientation === "landscape" ? "text-primary" : "text-muted-foreground"
              )}>Landscape (16:9)</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Template Style</Label>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => selectTemplate("auto")}
              className={cn(
                "rounded-xl border px-4 py-3 text-left transition-all",
                settings.template_preference === "auto" || !settings.template_preference
                  ? "border-primary bg-primary/10"
                  : "border-border/60 bg-background/60 hover:border-primary/40 hover:bg-primary/5"
              )}
            >
              <p className="text-sm font-bold text-foreground">Auto (AI Pick)</p>
              <p className="text-xs text-muted-foreground">AI chooses the best template for your product and orientation.</p>
            </button>

            {compatibleTemplates.map((templateId) => {
              const template = TEMPLATE_METADATA[templateId];
              const isSelected = settings.template_preference === templateId;
              return (
                <button
                  key={templateId}
                  onClick={() => selectTemplate(templateId)}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-left transition-all",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm shadow-primary/10"
                      : "border-border/60 bg-background/60 hover:border-primary/40 hover:bg-primary/5"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-foreground">{template.label}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      {template.tempo}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Video Duration</Label>
            <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-black text-primary">
              {settings.duration}s
            </div>
          </div>
          <div className="relative pt-2">
            <input
              type="range"
              min="20"
              max="60"
              step="5"
              value={settings.duration}
              onChange={(e) => setSettings({ ...settings, duration: parseInt(e.target.value) })}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary transition-all hover:bg-muted/80"
            />
            <div className="mt-3 flex justify-between text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-1">
              <span>Short</span>
              <span>Medium</span>
              <span>Long</span>
            </div>
          </div>
        </div>

      </div>

      <div className="relative overflow-hidden rounded-2xl bg-primary p-5 shadow-lg shadow-primary/20">
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-foreground/60">Estimated Workflow</p>
            <div className="h-1 w-8 rounded-full bg-primary-foreground/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/50">Total Length</p>
              <p className="text-xl font-black text-primary-foreground">{settings.duration}s</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/50">Scene Count</p>
              <p className="text-xl font-black text-primary-foreground">~{Math.ceil(settings.duration / 5)}</p>
            </div>
          </div>
        </div>
        {/* Decorative background element */}
        <div className="absolute -right-4 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      </div>
    </div>
  );
}
