import { VeoVideoGenerator } from "../lib/video-gen/veo";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Simple .env loader
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    envConfig.split("\n").forEach((line) => {
      const parts = line.split("=");
      if (parts.length === 2) {
        process.env[parts[0].trim()] = parts[1].trim();
      }
    });
  }
}

async function test() {
  loadEnv();
  
  const generator = new VeoVideoGenerator();
  
  // Minimal 1x1 red dot for testing
  const dummyImageUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  
  try {
    console.log("Starting Veo test...");
    const videoUrl = await generator.generate({
      imageUrl: dummyImageUrl,
      prompt: "A red dot pulsing gently",
      duration: 5,
      aspectRatio: "1:1"
    });
    
    console.log("Test Success! Video URL:", videoUrl);
  } catch (error) {
    console.error("Test Failed:", error);
  }
}

test();
