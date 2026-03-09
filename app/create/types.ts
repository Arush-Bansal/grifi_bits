
export type Step = 0 | 1 | 2 | 3 | 4;

export interface PlanConcept {
  id: string;
  title: string;
  description: string;
  imagePrompt: string;
  imagePreview?: string;
}

export interface VideoSettings {
  orientation: "landscape" | "portrait";
  duration: number;
  logoEnding: boolean;
  language: string;
  captions: boolean;
  additionalInstructions?: string;
}

export interface Scene {
  id: number;
  name: string;
  imagePrompt: string;
  videoScript: string;
  audioPrompt: string;
  imagePreview?: string;
  videoUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  mainReference?: string;
  secondaryReference?: string;
}

export interface SceneResult {
  id: number;
  imageUrl: string;
  videoUrl: string;
  audioUrl: string;
  audioDuration: number;
}

export interface ProjectDBData {
  id: string;
  product_name: string;
  product_description: string;
  scenes?: Scene[];
  image_names?: string[];
  captions_enabled?: boolean;
  music_track?: string;
  references?: ReferenceCard[];
  selected_reference?: string | null;
  plans?: PlanConcept[];
  selected_plan_index?: number;
  settings?: VideoSettings;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectData {
  productName: string;
  description: string;
  scenes?: Scene[];
  imageNames?: string[];
  captions?: boolean;
  music?: string;
  references?: ReferenceCard[];
  selectedReference?: string | null;
  plans?: PlanConcept[];
  selectedPlanIndex?: number;
  settings?: VideoSettings;
  createdAt?: string;
}

export type ReferenceCard = {
  id: string;
  label: string;
  tagline: string;
  image: string;
  aiPrompt?: string;
  originalName?: string;
};

export type SceneGenerating = Record<number, { image?: boolean; audio?: boolean }>;
export type EditingPrompt = Record<number, boolean>;

export type OrchestrationResult = {
  SCENES: Array<{ name: string; image_prompt: string; video_prompt: string; speech: string }>;
  REFERENCE_SPECS: Array<{ id: string; name: string; description: string; prompt: string }>;
  UPLOADED_IMAGE_SPECS?: Array<{ original_name: string; ai_name: string; ai_description: string }>;
};
