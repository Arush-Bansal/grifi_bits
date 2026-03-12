"use client";

import { Label } from "@/components/ui/label";
import { Smartphone, Monitor, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoSettings } from "../../types";
import { INDIAN_LANGUAGES } from "../../constants";

interface VideoSettingsSidebarProps {
  settings: VideoSettings;
  setSettings: (settings: VideoSettings) => void;
}

export function VideoSettingsSidebar({ settings, setSettings }: VideoSettingsSidebarProps) {
  return (
    <div className="space-y-6 rounded-2xl border border-border bg-gradient-to-b from-muted/50 to-muted/20 p-6">
      <h2 className="text-lg font-bold">Video Settings</h2>
      
      <div className="space-y-6">
        {/* Orientation */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Orientation</Label>
          <div className="flex gap-2">
            <button
              onClick={() => setSettings({ ...settings, orientation: "portrait" })}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all",
                settings.orientation === "portrait"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted"
              )}
            >
              <Smartphone className="h-5 w-5" />
              <span className="text-xs font-medium">Portrait (9:16)</span>
            </button>
            <button
              onClick={() => setSettings({ ...settings, orientation: "landscape" })}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all",
                settings.orientation === "landscape"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted"
              )}
            >
              <Monitor className="h-5 w-5" />
              <span className="text-xs font-medium">Landscape (16:9)</span>
            </button>
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Estimated Duration</Label>
            <span className="text-sm font-bold text-primary">{settings.duration}s</span>
          </div>
          <input
            type="range"
            min="20"
            max="60"
            step="5"
            value={settings.duration}
            onChange={(e) => setSettings({ ...settings, duration: parseInt(e.target.value) })}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-medium px-1">
            <span>20s</span>
            <span>40s</span>
            <span>60s</span>
          </div>
        </div>

        {/* Logo Scene Toggle */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4 shadow-sm">
          <div className="space-y-0.5">
            <Label className="text-sm font-semibold">Logo Ending Scene</Label>
            <p className="text-xs text-muted-foreground">Add your brand logo scene at the end of the video</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, logo_ending: !settings.logo_ending })}
            className={cn(
              "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-offset-background",
              settings.logo_ending ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                settings.logo_ending ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {/* Captions Toggle */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4 shadow-sm">
          <div className="space-y-0.5">
            <Label className="text-sm font-semibold">Captions</Label>
            <p className="text-xs text-muted-foreground">Show text overlays during the video</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, captions_enabled: !settings.captions_enabled })}
            className={cn(
              "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-offset-background",
              settings.captions_enabled ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                settings.captions_enabled ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {/* Language selection */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Language</Label>
          <div className="relative">
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all shadow-sm pr-10"
            >
              {INDIAN_LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
        <p className="text-[11px] text-primary/80 font-medium uppercase tracking-wider mb-2">Estimated Flow</p>
        <div className="space-y-1.5">
           <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Base duration</span>
              <span className="font-semibold">{settings.duration}s</span>
           </div>
           <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Scenes</span>
              <span className="font-semibold">~{Math.ceil(settings.duration / 5)} scenes</span>
           </div>
        </div>
      </div>
    </div>
  );
}
