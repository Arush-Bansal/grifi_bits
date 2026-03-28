"use client";

import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Music2, Upload, X, Loader2 } from "lucide-react";
import { VideoSettings } from "../../types";

interface MusicControlProps {
  settings: VideoSettings;
  setSettings: (updater: (prev: VideoSettings) => VideoSettings) => void;
}

export function MusicControl({ settings, setSettings }: MusicControlProps) {
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.urls?.[0]) {
        setSettings((prev) => ({
          ...prev,
          custom_music_url: data.urls[0],
          custom_music_name: file.name,
          music_track: "custom",
        }));
      }
    } catch (err) {
      console.error("Music upload failed:", err);
    } finally {
      setIsUploading(false);
      if (audioInputRef.current) audioInputRef.current.value = "";
    }
  };

  const removeCustomMusic = () => {
    setSettings((prev) => ({
      ...prev,
      custom_music_url: undefined,
      custom_music_name: undefined,
      music_track: "ambient-glow",
    }));
  };

  return (
    <div className="rounded-xl bg-secondary/50 p-4">
      <Label htmlFor="music">Music</Label>
      <div className="mt-2 space-y-3">
        <div className="flex items-center gap-3">
          <Music2 className="h-4 w-4 text-primary" />
          <select
            id="music"
            value={settings.music_track || "ambient-glow"}
            onChange={(e) => setSettings(prev => ({ ...prev, music_track: e.target.value }))}
            className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="none">None</option>
            <option value="ambient-glow">Ambient Glow</option>
            <option value="tension-pop">Tension Pop</option>
            <option value="clean-corporate">Clean Corporate</option>
            <option value="hyper-ugc">Hyper UGC</option>
            {settings.custom_music_url && (
              <option value="custom">{settings.custom_music_name || "Custom Track"}</option>
            )}
          </select>
        </div>

        {/* Custom Music Upload */}
        {settings.custom_music_url ? (
          <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-white/60 px-3 py-2">
            <Music2 className="h-3.5 w-3.5 text-primary" />
            <span className="flex-1 truncate text-xs text-muted-foreground">{settings.custom_music_name}</span>
            <button onClick={removeCustomMusic} className="rounded p-0.5 text-muted-foreground hover:text-destructive">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            disabled={isUploading}
            onClick={() => audioInputRef.current?.click()}
          >
            {isUploading ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Uploading...</> : <><Upload className="mr-2 h-3.5 w-3.5" /> Upload Custom Track</>}
          </Button>
        )}
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleMusicUpload}
        />
      </div>
    </div>
  );
}
