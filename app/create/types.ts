import { Database } from "@/lib/supabase/database.types";
import { TemplateId } from "@/lib/template-catalog";

export type StoryboardTimelineClip = {
  id: string;
  sceneId: number;
  title: string;
  start: number;
  end: number;
  color: string;
};

export type Step = 0 | 1 | 2; // 0: Setup, 1: Settings, 2: Preview

export type Json = Database['public']['Tables']['projects']['Row']['scenes'];

export type ProjectRow = Database['public']['Tables']['projects']['Row'];


export interface VideoSettings {
  orientation: "landscape" | "portrait";
  duration: number;
  product_urls?: string[];
  template_id?: TemplateId;
  template_preference?: TemplateId | "auto";
  brand_color?: string;
  music_track?: string;
  music_volume?: number;
  music_offset?: number;
  final_video_url?: string;
}

export interface Scene {
  id: number;
  name?: string;
  image_prompt?: string;
  video_prompt: string;
  speech?: string;
  image_url?: string | null;
  audio_url?: string | null;
  audio_duration?: number | null;
  video_url?: string | null;
  main_reference?: string | null;
  secondary_reference?: string | null;
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
  settings?: VideoSettings;
}

export interface ProjectUiState {
  editingRefId: string | null;
  isAutoSaveSuspended?: boolean;
}

export const initialProjectUiState: ProjectUiState = {
  editingRefId: null,
};

export type OrchestrationResult = {
  scenes: Scene[];
  references: ReferenceCard[];
};
