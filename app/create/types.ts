import { Database } from "@/lib/supabase/database.types";

export type Step = 0 | 1 | 2 | 3 | 4;

export type Json = Database['public']['Tables']['projects']['Row']['scenes'];

export type ProjectRow = Database['public']['Tables']['projects']['Row'];

export interface PlanConcept {
  id?: string;
  title: string;
  description: string;
  image_preview?: string;
}

export interface VideoSettings {
  orientation: "landscape" | "portrait";
  duration: number;
  logo_ending: boolean;
  language: string;
  captions_enabled: boolean;
  music_track?: string;
  additional_instructions?: string;
}

export interface Scene {
  id: number;
  name: string;
  video_prompt: string;
  image_prompt: string;
  speech: string;
  image_url?: string;
  audio_url?: string;
  audio_duration?: number;
  video_url?: string;
  main_reference?: string;
  secondary_reference?: string;
}

export interface ReferenceCard {
  id: string;
  label: string;
  tagline: string;
  image_url: string;
  ai_prompt?: string;
  original_name?: string;
}

/**
 * ProjectData matches the database schema exactly (snake_case)
 * but provides typed JSON fields for better development experience.
 * Metadata fields are optional for initial creation.
 */
export interface ProjectData extends Partial<Omit<ProjectRow, 'scenes' | 'references' | 'plans' | 'settings'>> {
  product_name: string; // Ensure name is always required
  scenes?: Scene[];
  references?: ReferenceCard[];
  plans?: PlanConcept[];
  settings?: VideoSettings;
}

export interface ProjectUiState {
  sceneGenerating: SceneGenerating;
  editingImagePrompt: EditingPrompt;
  editingAudioPrompt: EditingPrompt;
  editingRefId: string | null;
  isAutoSaveSuspended?: boolean;
}

export const initialProjectUiState: ProjectUiState = {
  sceneGenerating: {},
  editingImagePrompt: {},
  editingAudioPrompt: {},
  editingRefId: null,
};

export type SceneGenerating = Record<number, { image?: boolean; audio?: boolean }>;
export type EditingPrompt = Record<number, boolean>;

export type OrchestrationResult = {
  scenes: Scene[];
  references: ReferenceCard[];
};
