import { loadEnvConfig } from "@next/env";
import { generateImage } from "../lib/media-gen";
import { createSupabaseAdmin } from "../lib/supabase/server";

loadEnvConfig(process.cwd());

async function test() {
  console.log("Testing image generation and upload...");
  console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET");
  console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "NOT SET");
  console.log("GOOGLE_GENERATIVE_AI_API_KEY:", process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "SET" : "NOT SET");

  const supabase = createSupabaseAdmin();
  if (supabase) {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error("Error listing buckets:", error);
    } else {
      console.log("Available buckets:", buckets.map(b => b.name));
      const orbitAssets = buckets.find(b => b.name === "orbit-assets");
      if (!orbitAssets) {
          console.warn("WARNING: 'orbit-assets' bucket NOT found!");
      } else {
          console.log("Bucket 'orbit-assets' exists.");
      }
    }
  }

  try {
    const url = await generateImage("A small red cube", undefined, undefined, "1:1");
    console.log("Generated URL (truncated):", url.slice(0, 100) + "...");
    if (url.startsWith("http")) {
      console.log("SUCCESS: Image uploaded to Supabase Storage.");
    } else if (url.startsWith("data:image")) {
      console.log("FAILURE: Image returned as base64 string.");
    } else {
      console.log("FAILURE: Unexpected response format.");
    }
  } catch (error) {
    console.error("ERROR during test:", error);
  }
}

test();
