"use client";

import { useAiPlan } from "../_hooks/useAiPlan";
import { VideoSettingsSidebar } from "../setup/_components/VideoSettingsSidebar";
import { StepNavigation } from "../_components/step-navigation";

export default function SettingsPage() {
  const { settings, setSettings } = useAiPlan();

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <VideoSettingsSidebar 
          settings={settings}
          setSettings={setSettings}
        />
      </div>

      <StepNavigation />
    </>
  );
}
