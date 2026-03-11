"use client";

import { CheckCircle2, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomConceptCardProps {
  isSelected: boolean;
  onClick: () => void;
}

export function CustomConceptCard({ isSelected, onClick }: CustomConceptCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center p-4 text-center transition-all rounded-2xl border-2 border-dashed",
        isSelected
          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
          : "border-border bg-background hover:border-primary/40"
      )}
    >
      {isSelected && (
        <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-primary" />
      )}
      <div className="mb-2 rounded-full bg-primary/10 p-2">
        <MessageSquareText className="h-4 w-4 text-primary" />
      </div>
      <h3 className="font-bold text-xs mb-1">Write your own</h3>
      <p className="text-[10px] text-muted-foreground">
        Define your own concept
      </p>
    </button>
  );
}
