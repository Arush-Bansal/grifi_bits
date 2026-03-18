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
        

      </div>
    </div>
  );
}
