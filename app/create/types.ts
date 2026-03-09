import { Database } from "@/lib/supabase/database.types";

export type Step = 0 | 1 | 2 | 3 | 4;

export type Json = Database['public']['Tables']['projects']['Row']['scenes'];

export type ProjectRow = Database['public']['Tables']['projects']['Row'];

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
  musicTrack?: string;
}

export interface Scene {
  id: number;
  name: string;
  imagePrompt: string;
  videoScript: string;
  audioPrompt: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  mainReference?: string;
  secondaryReference?: string;
}

export interface ReferenceCard {
  id: string;
  label: string;
  tagline: string;
  image: string;
  aiPrompt?: string;
  originalName?: string;
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

export type SceneGenerating = Record<number, { image?: boolean; audio?: boolean }>;
export type EditingPrompt = Record<number, boolean>;

export type OrchestrationResult = {
  scenes: Scene[];
  references: ReferenceCard[];
};
