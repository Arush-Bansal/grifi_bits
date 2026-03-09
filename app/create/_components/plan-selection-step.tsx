"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RefreshCw, CheckCircle2, Monitor, Smartphone, Volume2, ChevronDown, MessageSquareText } from "lucide-react";
import Image from "next/image";
import { PlanConcept, VideoSettings } from "../types";
import { cn } from "@/lib/utils";
import { INDIAN_LANGUAGES } from "../constants";

interface PlanSelectionStepProps {
  plans: PlanConcept[];
  selected_plan_index: number;
  setSelectedPlanIndex: (index: number) => void;
  settings: VideoSettings;
  setSettings: (settings: VideoSettings | ((prev: VideoSettings) => VideoSettings)) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function PlanSelectionStep({
  plans,
  selected_plan_index,
  setSelectedPlanIndex,
  settings,
  setSettings,
  onRefresh,
  isRefreshing,
}: PlanSelectionStepProps) {
  const selectedPlan = plans[selected_plan_index];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      {/* Left 65% area */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Select an AI Concept</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="text-primary hover:text-primary/80"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh Concepts
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((plan, index) => (
            <button
              key={plan.id || index}
              onClick={() => setSelectedPlanIndex(index)}
              className={cn(
                "relative flex flex-col items-start p-4 text-left transition-all rounded-2xl border-2",
                selected_plan_index === index
                  ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
                  : "border-border bg-background hover:border-primary/40"
              )}
            >
              {selected_plan_index === index && (
                <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-primary" />
              )}
              <h3 className="font-bold text-sm mb-1">{plan.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-3">
                {plan.description}
              </p>
            </button>
          ))}
        </div>

        {selectedPlan && (
          <>
            <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-secondary/20 p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative aspect-square w-full md:w-64 flex-shrink-0 overflow-hidden rounded-xl border-2 border-primary/20 shadow-lg">
                  {selectedPlan.image_preview ? (
                    <Image
                      src={selectedPlan.image_preview}
                      alt={selectedPlan.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted animate-pulse">
                      <span className="text-xs text-muted-foreground">Generating square preview...</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-primary">{selectedPlan.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {selectedPlan.description}
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      <Volume2 className="mr-1 h-3 w-3" />
                      Premium Script Generation
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary/80">
                <MessageSquareText className="h-4 w-4" />
                <Label>Additional Instructions (Optional)</Label>
              </div>
              <textarea
                placeholder="E.g. Make it more upbeat, focus on the ingredients, use a specific tone..."
                value={settings.additional_instructions || ""}
                onChange={(e) => setSettings({ ...settings, additional_instructions: e.target.value })}
                className="w-full min-h-[100px] rounded-2xl border border-border bg-background p-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-sm placeholder:text-muted-foreground/50"
              />
            </div>
          </>
        )}
      </div>

      {/* Right Settings area */}
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
    </div>
  );
}
