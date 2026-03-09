export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          product_name: string
          product_description: string | null
          image_names: string[] | null
          selected_reference: string | null
          scenes: Json | null
          references: Json | null
          plans: Json | null
          selected_plan_index: number | null
          settings: Json | null
          captions_enabled: boolean | null
          music_track: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          product_name: string
          product_description?: string | null
          image_names?: string[] | null
          selected_reference?: string | null
          scenes?: Json | null
          references?: Json | null
          plans?: Json | null
          selected_plan_index?: number | null
          settings?: Json | null
          captions_enabled?: boolean | null
          music_track?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          product_name?: string
          product_description?: string | null
          image_names?: string[] | null
          selected_reference?: string | null
          scenes?: Json | null
          references?: Json | null
          plans?: Json | null
          selected_plan_index?: number | null
          settings?: Json | null
          captions_enabled?: boolean | null
          music_track?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      project_references: {
        Row: {
          id: string
          project_id: string
          reference_key: string
          label: string | null
          tagline: string | null
          original_name: string | null
          ai_prompt: string | null
          image_url: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          reference_key: string
          label?: string | null
          tagline?: string | null
          original_name?: string | null
          ai_prompt?: string | null
          image_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          reference_key?: string
          label?: string | null
          tagline?: string | null
          original_name?: string | null
          ai_prompt?: string | null
          image_url?: string | null
          created_at?: string | null
        }
      }
      scenes: {
        Row: {
          id: string
          project_id: string
          name: string
          image_prompt: string | null
          video_prompt: string | null
          speech: string | null
          scene_order: number
          duration_seconds: number | null
          image_url: string | null
          video_url: string | null
          audio_url: string | null
          audio_duration: number | null
          main_reference: string | null
          secondary_reference: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          image_prompt?: string | null
          video_prompt?: string | null
          speech?: string | null
          scene_order: number
          duration_seconds?: number | null
          image_url?: string | null
          video_url?: string | null
          audio_url?: string | null
          audio_duration?: number | null
          main_reference?: string | null
          secondary_reference?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          image_prompt?: string | null
          video_prompt?: string | null
          speech?: string | null
          scene_order?: number
          duration_seconds?: number | null
          image_url?: string | null
          video_url?: string | null
          audio_url?: string | null
          audio_duration?: number | null
          main_reference?: string | null
          secondary_reference?: string | null
          created_at?: string | null
        }
      }
      assets: {
        Row: {
          id: string
          project_id: string
          type: string
          url: string
          storage_path: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          type: string
          url: string
          storage_path?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          type?: string
          url?: string
          storage_path?: string | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
