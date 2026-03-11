"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Volume2, MessageSquareText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PlanConcept, VideoSettings } from "../../types";

interface ConceptPreviewProps {
  selectedPlan: PlanConcept;
  settings: VideoSettings;
  setSettings: (settings: VideoSettings) => void;
}

export function ConceptPreview({ selectedPlan, settings, setSettings }: ConceptPreviewProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Reset loading state when the selected plan's image changes
  useEffect(() => {
    setIsImageLoading(true);
  }, [selectedPlan.image_preview]);
  return (
    <>
      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-secondary/20 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative aspect-square w-full md:w-64 flex-shrink-0 overflow-hidden rounded-xl border-2 border-primary/20 shadow-lg">
            {selectedPlan.image_preview && typeof selectedPlan.image_preview === 'string' && selectedPlan.image_preview.startsWith('http') ? (
              <>
                {isImageLoading && (
                  <Skeleton className="absolute inset-0 h-full w-full rounded-xl z-10" />
                )}
                <Image
                  src={selectedPlan.image_preview}
                  alt={selectedPlan.title}
                  fill
                  className={cn(
                    "object-cover transition-opacity duration-300",
                    isImageLoading ? "opacity-0" : "opacity-100"
                  )}
                  onLoad={() => setIsImageLoading(false)}
                  unoptimized
                />
              </>
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
  );
}
