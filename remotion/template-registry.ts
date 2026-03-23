import React from "react";
import { ProductDemoTemplate } from "./templates/ProductDemoTemplate";
import { MinimalistTemplate } from "./templates/MinimalistTemplate";
import { DynamicSocialTemplate } from "./templates/DynamicSocialTemplate";
import { SplitScreenTemplate } from "./templates/SplitScreenTemplate";
import { LogoTemplate } from "./templates/LogoTemplate";
import { PhoneShowcaseTemplate } from "./templates/PhoneShowcaseTemplate";
import { BentoGridTemplate } from "./templates/BentoGridTemplate";
import { AppleExplodedViewTemplate } from "./templates/AppleExplodedViewTemplate";
import { ComparisonSliderTemplate } from "./templates/ComparisonSliderTemplate";
import { LiquidMorphTemplate } from "./templates/LiquidMorphTemplate";
import { SocialProofCarouselTemplate } from "./templates/SocialProofCarouselTemplate";
import { Top5CountdownTemplate } from "./templates/Top5CountdownTemplate";
import { UGCCalloutTemplate } from "./templates/UGCCalloutTemplate";
import { PaperPopTemplate } from "./templates/PaperPopTemplate";
import { SimulatedUIWalkthroughTemplate } from "./templates/SimulatedUIWalkthroughTemplate";
import { DynamicDataDashboardTemplate } from "./templates/DynamicDataDashboardTemplate";
import { MinimalistBlueprintTemplate } from "./templates/MinimalistBlueprintTemplate";
import { HolographicHUDTemplate } from "./templates/HolographicHUDTemplate";
import { CinematicUnboxingTemplate } from "./templates/CinematicUnboxingTemplate";
import { HighEnergyDropTemplate } from "./templates/HighEnergyDropTemplate";
import { InfinityScrollTemplate } from "./templates/InfinityScrollTemplate";
import { FeatureBinaryTemplate } from "./templates/FeatureBinaryTemplate";
import { NeonNightTemplate } from "./templates/NeonNightTemplate";
import { RetroVHSTemplate } from "./templates/RetroVHSTemplate";
import { GlassmorphismTemplate } from "./templates/GlassmorphismTemplate";
import { ParallaxDepthTemplate } from "./templates/ParallaxDepthTemplate";
import { AestheticLookbookTemplate } from "./templates/AestheticLookbookTemplate";
import { FoodieCloseUpTemplate } from "./templates/FoodieCloseUpTemplate";
import { InteriorShowcaseTemplate } from "./templates/InteriorShowcaseTemplate";
import { DailyRoutineTemplate } from "./templates/DailyRoutineTemplate";
import { WellnessFlowTemplate } from "./templates/WellnessFlowTemplate";
import { MaterialFocusTemplate } from "./templates/MaterialFocusTemplate";
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
  LogoTemplate: {
    component: LogoTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.LogoTemplate.sceneDurationSeconds,
  },
  PhoneShowcase: {
    component: PhoneShowcaseTemplate,
    width: 1080,
    height: 1920,
    sceneDurationSeconds: TEMPLATE_METADATA.PhoneShowcase.sceneDurationSeconds,
  },
  BentoGrid: {
    component: BentoGridTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.BentoGrid.sceneDurationSeconds,
  },
  AppleExplodedView: {
    component: AppleExplodedViewTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.AppleExplodedView.sceneDurationSeconds,
  },
  ComparisonSlider: {
    component: ComparisonSliderTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.ComparisonSlider.sceneDurationSeconds,
  },
  LiquidMorph: {
    component: LiquidMorphTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.LiquidMorph.sceneDurationSeconds,
  },
  SocialProofCarousel: {
    component: SocialProofCarouselTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.SocialProofCarousel.sceneDurationSeconds,
  },
  Top5Countdown: {
    component: Top5CountdownTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.Top5Countdown.sceneDurationSeconds,
  },
  UGCCallout: {
    component: UGCCalloutTemplate,
    width: 1080,
    height: 1920,
    sceneDurationSeconds: TEMPLATE_METADATA.UGCCallout.sceneDurationSeconds,
  },
  PaperPop: {
    component: PaperPopTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.PaperPop.sceneDurationSeconds,
  },
  SimulatedUIWalkthrough: {
    component: SimulatedUIWalkthroughTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.SimulatedUIWalkthrough.sceneDurationSeconds,
  },
  DynamicDataDashboard: {
    component: DynamicDataDashboardTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.DynamicDataDashboard.sceneDurationSeconds,
  },
  MinimalistBlueprint: {
    component: MinimalistBlueprintTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.MinimalistBlueprint.sceneDurationSeconds,
  },
  HolographicHUD: {
    component: HolographicHUDTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.HolographicHUD.sceneDurationSeconds,
  },
  CinematicUnboxing: {
    component: CinematicUnboxingTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.CinematicUnboxing.sceneDurationSeconds,
  },
  HighEnergyDrop: {
    component: HighEnergyDropTemplate,
    width: 1080,
    height: 1920,
    sceneDurationSeconds: TEMPLATE_METADATA.HighEnergyDrop.sceneDurationSeconds,
  },
  InfinityScroll: {
    component: InfinityScrollTemplate,
    width: 1080,
    height: 1920,
    sceneDurationSeconds: TEMPLATE_METADATA.InfinityScroll.sceneDurationSeconds,
  },
  FeatureBinary: {
    component: FeatureBinaryTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.FeatureBinary.sceneDurationSeconds,
  },
  NeonNight: {
    component: NeonNightTemplate,
    width: 1080,
    height: 1920,
    sceneDurationSeconds: TEMPLATE_METADATA.NeonNight.sceneDurationSeconds,
  },
  RetroVHS: {
    component: RetroVHSTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.RetroVHS.sceneDurationSeconds,
  },
  Glassmorphism: {
    component: GlassmorphismTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.Glassmorphism.sceneDurationSeconds,
  },
  ParallaxDepth: {
    component: ParallaxDepthTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.ParallaxDepth.sceneDurationSeconds,
  },
  AestheticLookbook: {
    component: AestheticLookbookTemplate,
    width: 1080,
    height: 1920,
    sceneDurationSeconds: TEMPLATE_METADATA.AestheticLookbook.sceneDurationSeconds,
  },
  FoodieCloseUp: {
    component: FoodieCloseUpTemplate,
    width: 1080,
    height: 1920,
    sceneDurationSeconds: TEMPLATE_METADATA.FoodieCloseUp.sceneDurationSeconds,
  },
  InteriorShowcase: {
    component: InteriorShowcaseTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.InteriorShowcase.sceneDurationSeconds,
  },
  DailyRoutine: {
    component: DailyRoutineTemplate,
    width: 1080,
    height: 1920,
    sceneDurationSeconds: TEMPLATE_METADATA.DailyRoutine.sceneDurationSeconds,
  },
  WellnessFlow: {
    component: WellnessFlowTemplate,
    width: 1080,
    height: 1920,
    sceneDurationSeconds: TEMPLATE_METADATA.WellnessFlow.sceneDurationSeconds,
  },
  MaterialFocus: {
    component: MaterialFocusTemplate,
    width: 1920,
    height: 1080,
    sceneDurationSeconds: TEMPLATE_METADATA.MaterialFocus.sceneDurationSeconds,
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
