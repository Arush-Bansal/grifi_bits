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
import { TemplateId } from "../lib/template-catalog";

export const TEMPLATE_COMPONENTS: Partial<Record<TemplateId, React.ComponentType<any>>> = {
  ProductDemo: ProductDemoTemplate,
  ProductDemoVertical: ProductDemoTemplate,
  Minimalist: MinimalistTemplate,
  DynamicSocial: DynamicSocialTemplate,
  SplitScreen: SplitScreenTemplate,
  LogoTemplate: LogoTemplate,
  PhoneShowcase: PhoneShowcaseTemplate,
  BentoGrid: BentoGridTemplate,
  AppleExplodedView: AppleExplodedViewTemplate,
  ComparisonSlider: ComparisonSliderTemplate,
  LiquidMorph: LiquidMorphTemplate,
  SocialProofCarousel: SocialProofCarouselTemplate,
  Top5Countdown: Top5CountdownTemplate,
  UGCCallout: UGCCalloutTemplate,
  PaperPop: PaperPopTemplate,
  SimulatedUIWalkthrough: SimulatedUIWalkthroughTemplate,
  DynamicDataDashboard: DynamicDataDashboardTemplate,
  MinimalistBlueprint: MinimalistBlueprintTemplate,
  HolographicHUD: HolographicHUDTemplate,
  CinematicUnboxing: CinematicUnboxingTemplate,
  HighEnergyDrop: HighEnergyDropTemplate,
  InfinityScroll: InfinityScrollTemplate,
  FeatureBinary: FeatureBinaryTemplate,
  NeonNight: NeonNightTemplate,
  RetroVHS: RetroVHSTemplate,
  Glassmorphism: GlassmorphismTemplate,
  ParallaxDepth: ParallaxDepthTemplate,
  AestheticLookbook: AestheticLookbookTemplate,
  FoodieCloseUp: FoodieCloseUpTemplate,
  InteriorShowcase: InteriorShowcaseTemplate,
  DailyRoutine: DailyRoutineTemplate,
  WellnessFlow: WellnessFlowTemplate,
  MaterialFocus: MaterialFocusTemplate,
};
