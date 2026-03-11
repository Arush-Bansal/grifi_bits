"use client";

import { Label } from "@/components/ui/label";
import { Music2 } from "lucide-react";
import { VideoSettings } from "../../types";

interface MusicControlProps {
  settings: VideoSettings;
  setSettings: (updater: (prev: VideoSettings) => VideoSettings) => void;
}

export function MusicControl({ settings, setSettings }: MusicControlProps) {
  return (
    <div className="rounded-xl bg-secondary/50 p-4">
      <Label htmlFor="music">Music</Label>
      <div className="mt-2 space-y-4">
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
          </select>
        </div>
        
        {settings.music_track !== "none" && (
          <div className="grid gap-4 pl-7 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="music-offset" className="text-xs text-muted-foreground">Offset (seconds)</Label>
              <input
                id="music-offset"
                type="number"
                min={0}
                step={0.5}
                value={settings.music_offset ?? 0}
                onChange={(e) => setSettings(prev => ({ ...prev, music_offset: parseFloat(e.target.value) || 0 }))}
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="music-volume" className="text-xs text-muted-foreground">
                Volume ({settings.music_volume ?? 50}%)
              </Label>
              <input
                id="music-volume"
                type="range"
                min={0}
                max={100}
                step={1}
                value={settings.music_volume ?? 50}
                onChange={(e) => setSettings(prev => ({ ...prev, music_volume: parseInt(e.target.value, 10) }))}
                className="w-full accent-primary"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
