import React from "react";
import { MainAdTemplate } from "./templates/MainAdTemplate";
import { DEFAULT_TEMPLATE_ID, TEMPLATE_METADATA, TemplateId } from "../lib/template-catalog";
import { TEMPLATE_COMPONENTS } from "./template-components";

export type TemplateScene = {
  id: number;
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
};

export type TemplateConfig = {
  component: React.ComponentType<{
    scenes?: TemplateScene[];
    productName?: string;
    brandColor?: string;
  }>;
  width: number;
  height: number;
  sceneDurationSeconds: number;
};

// This helper constructs the registry by combining components from template-components.ts
// with the metadata from template-catalog.ts
const buildRegistry = (): Record<TemplateId, TemplateConfig> => {
  const registry: any = {};
  
  // Fill in all standard templates from TEMPLATE_COMPONENTS
  (Object.keys(TEMPLATE_COMPONENTS) as TemplateId[]).forEach((id) => {
    const metadata = TEMPLATE_METADATA[id];
    const component = TEMPLATE_COMPONENTS[id];
    if (metadata && component) {
      registry[id] = {
        component,
        width: metadata.orientation === "landscape" ? 1920 : 1080,
        height: metadata.orientation === "landscape" ? 1080 : 1920,
        sceneDurationSeconds: metadata.sceneDurationSeconds,
      };
    }
  });

  // Add the Special MainAd component
  registry.MainAd = {
    component: MainAdTemplate as any,
    width: 1080,
    height: 1920,
    sceneDurationSeconds: 4,
  };

  return registry;
};

export const TEMPLATE_REGISTRY: Record<TemplateId, TemplateConfig> = buildRegistry();

export function resolveTemplateConfig(templateId?: TemplateId): TemplateConfig {
  if (templateId && TEMPLATE_REGISTRY[templateId]) {
    return TEMPLATE_REGISTRY[templateId];
  }
  return TEMPLATE_REGISTRY[DEFAULT_TEMPLATE_ID];
}

export function getTemplateDurationInFrames(
  templateId: TemplateId | undefined,
  sceneCount: number,
  fps: number
): number {
  const config = resolveTemplateConfig(templateId);
  const normalizedSceneCount = Math.max(1, sceneCount);
  return Math.max(fps, Math.round(config.sceneDurationSeconds * normalizedSceneCount * fps));
}
