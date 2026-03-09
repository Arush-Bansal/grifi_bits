-- Supabase Schema for Orbit UGC Studio

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name TEXT NOT NULL,
  product_description TEXT,
  image_names TEXT[] DEFAULT '{}',
  selected_reference TEXT,
  scenes JSONB DEFAULT '[]',
  "references" JSONB DEFAULT '[]',
  plans JSONB DEFAULT '[]',
  selected_plan_index INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  captions_enabled BOOLEAN DEFAULT TRUE,
  music_track TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reference Specs table
CREATE TABLE IF NOT EXISTS project_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  reference_key TEXT NOT NULL,
  label TEXT,
  tagline TEXT,
  original_name TEXT,
  ai_prompt TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scenes table
CREATE TABLE IF NOT EXISTS scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_prompt TEXT,
  video_prompt TEXT,
  speech TEXT,
  scene_order INTEGER NOT NULL,
  duration_seconds FLOAT DEFAULT 5.0,
  image_url TEXT,
  video_url TEXT,
  audio_url TEXT,
  audio_duration FLOAT,
  main_reference TEXT,
  secondary_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets table (for general storage tracking)
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'image', 'video', 'audio'
  url TEXT NOT NULL,
  storage_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
