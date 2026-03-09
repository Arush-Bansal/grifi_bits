import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { createSupabaseAdmin } from "../lib/supabase/server";

async function setupBucket() {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    console.error("Supabase admin client not initialized.");
    return;
  }

  console.log("Checking buckets...");
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("Error listing buckets:", listError);
    return;
  }

  console.log("Existing buckets:", buckets.map(b => b.name));
  
  if (!buckets.find(b => b.name === "orbit-assets")) {
    console.log("Creating bucket 'orbit-assets'...");
    const { data, error } = await supabase.storage.createBucket("orbit-assets", {
      public: true,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
      fileSizeLimit: "5MB"
    });

    if (error) {
      console.error("Error creating bucket:", error);
    } else {
      console.log("Bucket 'orbit-assets' created successfully.");
    }
  } else {
    console.log("Bucket 'orbit-assets' already exists.");
  }
}

setupBucket();
