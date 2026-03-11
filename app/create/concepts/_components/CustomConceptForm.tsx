"use client";

import { MessageSquareText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { PlanConcept, VideoSettings } from "../../types";

interface CustomConceptFormProps {
  custom_concept: PlanConcept | null | undefined;
  setCustomConcept: (concept: PlanConcept) => void;
  settings: VideoSettings;
  setSettings: (settings: VideoSettings) => void;
}

export function CustomConceptForm({ 
  custom_concept, 
  setCustomConcept, 
  settings, 
  setSettings 
}: CustomConceptFormProps) {
  return (
    <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="space-y-4 rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 shadow-sm">
        <div className="space-y-2">
          <Label className="text-sm font-bold text-primary">Concept Title</Label>
          <input
            type="text"
            placeholder="E.g. The Sustainable Morning Routine"
            value={custom_concept?.title || ""}
            onChange={(e) => setCustomConcept({ ...(custom_concept || { title: "", description: "" }), title: e.target.value })}
            className="w-full rounded-xl border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-bold text-primary">Concept Description</Label>
          <textarea
            placeholder="Describe your ad concept in detail..."
            value={custom_concept?.description || ""}
            onChange={(e) => setCustomConcept({ ...(custom_concept || { title: "", description: "" }), description: e.target.value })}
            className="w-full min-h-[120px] rounded-xl border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-3">
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
    </div>
  );
}
