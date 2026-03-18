import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function setupStorage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase environment variables.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const buckets = ["orbit-assets"];

  for (const bucketName of buckets) {
    console.log(`Checking bucket: ${bucketName}...`);
    
    const { data: bucket, error: getError } = await supabase.storage.getBucket(bucketName);

    if (getError) {
      if (getError.message.includes("not found")) {
        console.log(`Bucket ${bucketName} not found. Creating...`);
        const { data: createData, error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ["image/*", "video/*", "audio/*"],
          fileSizeLimit: 52428800 // 50MB
        });

        if (createError) {
          console.error(`Error creating bucket ${bucketName}:`, createError.message);
        } else {
          console.log(`Successfully created bucket ${bucketName}.`);
        }
      } else {
        console.error(`Error checking bucket ${bucketName}:`, getError.message);
      }
    } else {
      console.log(`Bucket ${bucketName} already exists.`);
      // Update to public if it's not
      if (!bucket.public) {
        console.log(`Setting bucket ${bucketName} to public...`);
        await supabase.storage.updateBucket(bucketName, { public: true });
      }
    }
  }

  console.log("Storage setup complete.");
}

setupStorage().catch(console.error);
