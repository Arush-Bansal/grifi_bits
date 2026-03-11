"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanConcept } from "../../types";

interface ConceptCardProps {
  plan: PlanConcept;
  isSelected: boolean;
  onClick: () => void;
}

export function ConceptCard({ plan, isSelected, onClick }: ConceptCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-start p-4 text-left transition-all rounded-2xl border-2",
        isSelected
          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
          : "border-border bg-background hover:border-primary/40"
      )}
    >
      {isSelected && (
        <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-primary" />
      )}
      <h3 className="font-bold text-xs mb-1 line-clamp-2">{plan.title}</h3>
      <p className="text-[10px] text-muted-foreground line-clamp-3">
        {plan.description}
      </p>
    </button>
  );
}
