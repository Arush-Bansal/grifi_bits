"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { StepNavigation } from "../_components/step-navigation";
import { useConceptsPage } from "./_hooks/useConceptsPage";

// Internal Components
import { ConceptCard } from "./_components/ConceptCard";
import { CustomConceptCard } from "./_components/CustomConceptCard";
import { ConceptPreview } from "./_components/ConceptPreview";
import { CustomConceptForm } from "./_components/CustomConceptForm";
import { VideoSettingsSidebar } from "./_components/VideoSettingsSidebar";

export default function ConceptsPage() {
  const {
    plans,
    selected_plan_index,
    setSelectedPlanIndex,
    custom_concept,
    setCustomConcept,
    settings,
    setSettings,
    selectedPlan,
    onRefresh,
    isRefreshing,
  } = useConceptsPage();

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left Area: Concept Selection */}
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

          <div className="grid gap-4 sm:grid-cols-4">
            {plans.map((plan, index) => (
              <ConceptCard
                key={plan.id || index}
                plan={plan}
                isSelected={selected_plan_index === index}
                onClick={() => setSelectedPlanIndex(index)}
              />
            ))}

            {/* Custom Concept Option */}
            <CustomConceptCard
              isSelected={selected_plan_index === plans.length}
              onClick={() => setSelectedPlanIndex(plans.length)}
            />
          </div>

          {/* AI Concept Preview */}
          {selected_plan_index < plans.length && selectedPlan && (
            <ConceptPreview
              selectedPlan={selectedPlan}
              settings={settings}
              setSettings={setSettings}
            />
          )}

          {/* Custom Concept Form */}
          {selected_plan_index === plans.length && (
            <CustomConceptForm
              custom_concept={custom_concept}
              setCustomConcept={setCustomConcept}
              settings={settings}
              setSettings={setSettings}
            />
          )}
        </div>

        {/* Right Area: Video Settings */}
        <VideoSettingsSidebar
          settings={settings}
          setSettings={setSettings}
        />
      </div>
      <StepNavigation />
    </>
  );
}
