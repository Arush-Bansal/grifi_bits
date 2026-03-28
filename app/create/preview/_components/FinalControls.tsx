"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MusicControl } from "./music-control";
import { VideoSettings } from "../../types";
import { AIChat } from "../../_components/ai-chat";
import { Palette, Type, Image, MousePointerClick, X, Loader2 } from "lucide-react";

const FONT_OPTIONS = [
  { value: "Arial", label: "Arial" },
  { value: "Georgia", label: "Georgia" },
  { value: "Inter", label: "Inter" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Roboto Mono", label: "Roboto Mono" },
];

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
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.urls?.[0]) {
        setSettings((prev) => ({ ...prev, logo_url: data.urls[0] }));
      }
    } catch (err) {
      console.error("Logo upload failed:", err);
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="space-y-4 rounded-2xl border border-border bg-white/85 p-5">

        {/* Background Color */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Palette className="h-3.5 w-3.5" /> Background Color
          </Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={settings.bg_color || "#000000"}
              onChange={(e) => setSettings((prev) => ({ ...prev, bg_color: e.target.value }))}
              className="h-9 w-9 cursor-pointer rounded-lg border border-border/50 bg-transparent p-0.5"
            />
            <Input
              value={settings.bg_color || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^#[0-9a-fA-F]{0,6}$/.test(val)) {
                  setSettings((prev) => ({ ...prev, bg_color: val || undefined }));
                }
              }}
              placeholder="#000000"
              className="h-9 w-28 font-mono text-sm"
            />
          </div>
        </div>

        {/* Font Family */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Type className="h-3.5 w-3.5" /> Font
          </Label>
          <select
            value={settings.font_family || ""}
            onChange={(e) => setSettings((prev) => ({ ...prev, font_family: e.target.value || undefined }))}
            className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Default (template)</option>
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* CTA Text */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <MousePointerClick className="h-3.5 w-3.5" /> CTA Text
          </Label>
          <Input
            value={settings.cta_text || ""}
            onChange={(e) => setSettings((prev) => ({ ...prev, cta_text: e.target.value || undefined }))}
            placeholder="e.g. Shop Now"
            className="h-9 text-sm"
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Image className="h-3.5 w-3.5" /> Logo / Watermark
          </Label>
          {settings.logo_url ? (
            <div className="flex items-center gap-3">
              <img src={settings.logo_url} alt="Logo" className="h-10 w-10 rounded-md border border-border object-contain bg-white" />
              <span className="flex-1 truncate text-xs text-muted-foreground">Uploaded</span>
              <button
                onClick={() => setSettings((prev) => ({ ...prev, logo_url: undefined }))}
                className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              disabled={isUploadingLogo}
              onClick={() => logoInputRef.current?.click()}
            >
              {isUploadingLogo ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Uploading...</> : "Upload Logo"}
            </Button>
          )}
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
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
