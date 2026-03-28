"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Smartphone, Monitor, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoSettings } from "../../types";
import { TemplateId } from "@/lib/template-catalog";

interface VideoSettingsSidebarProps {
  settings: VideoSettings;
  setSettings: (settings: VideoSettings | ((prev: VideoSettings) => VideoSettings)) => void;
}

export function VideoSettingsSidebar({ settings, setSettings }: VideoSettingsSidebarProps) {
  useEffect(() => {
    // Ensure the correct MainAd template is set for the current orientation
    const expectedTemplate = settings.orientation === "portrait" ? "MainAd" : "MainAdLandscape";
    if (settings.template_id !== expectedTemplate) {
      setSettings((prev) => ({
        ...prev,
        template_id: expectedTemplate as TemplateId,
        template_preference: expectedTemplate as TemplateId,
      }));
    }
  }, [settings.orientation, settings.template_id, setSettings]);

  const updateOrientation = (orientation: "portrait" | "landscape") => {
    const nextTemplate = orientation === "portrait" ? "MainAd" : "MainAdLandscape";
    
    setSettings((prev) => ({
      ...prev,
      orientation,
      template_preference: nextTemplate as TemplateId,
      template_id: nextTemplate as TemplateId,
    }));
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
              onChange={(e) => setSettings((prev) => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary transition-all hover:bg-muted/80"
            />
            <div className="mt-3 flex justify-between text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-1">
              <span>Short</span>
              <span>Medium</span>
              <span>Long</span>
            </div>
          </div>
        </div>

        {/* Brand Color */}
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Brand Color</Label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="color"
                value={settings.brand_color || "#f97316"}
                onChange={(e) => setSettings((prev) => ({ ...prev, brand_color: e.target.value }))}
                className="h-10 w-10 cursor-pointer rounded-lg border border-border/50 bg-transparent p-0.5"
              />
            </div>
            <Input
              value={settings.brand_color || "#f97316"}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
                  setSettings((prev) => ({ ...prev, brand_color: val }));
                }
              }}
              placeholder="#f97316"
              className="h-10 w-28 font-mono text-sm"
            />
            <Palette className="h-4 w-4 text-muted-foreground" />
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
