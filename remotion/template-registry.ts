import React from "react";
import { ProductDemoTemplate } from "./templates/ProductDemoTemplate";
import { MinimalistTemplate } from "./templates/MinimalistTemplate";
import { DynamicSocialTemplate } from "./templates/DynamicSocialTemplate";
import { SplitScreenTemplate } from "./templates/SplitScreenTemplate";
import { DEFAULT_TEMPLATE_ID, TEMPLATE_METADATA, TemplateId } from "../lib/template-catalog";

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

export const TEMPLATE_REGISTRY: Record<TemplateId, TemplateConfig> = {
  ProductDemo: {
    component: ProductDemoTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.ProductDemo.sceneDurationSeconds,
  },
  ProductDemoVertical: {
    component: ProductDemoTemplate,
    width: 1080,
    height: 1920,
    sceneDurationSeconds: TEMPLATE_METADATA.ProductDemoVertical.sceneDurationSeconds,
  },
  Minimalist: {
    component: MinimalistTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.Minimalist.sceneDurationSeconds,
  },
  DynamicSocial: {
    component: DynamicSocialTemplate,
    width: 1080,
    height: 1920,
    sceneDurationSeconds: TEMPLATE_METADATA.DynamicSocial.sceneDurationSeconds,
  },
  SplitScreen: {
    component: SplitScreenTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.SplitScreen.sceneDurationSeconds,
  },
};

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
