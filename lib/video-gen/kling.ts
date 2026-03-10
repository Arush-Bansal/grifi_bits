import * as fal from "@fal-ai/serverless-client";
import { VideoGenerator, VideoGenerationOptions } from "./types";

export class KlingVideoGenerator implements VideoGenerator {
  id = 'kling-video';

  async generate(options: VideoGenerationOptions): Promise<string> {
    const { imageUrl, prompt, duration = 5, aspectRatio = "9:16" } = options;
    console.log(`[MediaGen] Generating video with Fal.ai: ${prompt.slice(0, 50)}...`);
    
    try {
      const result = await fal.run("fal-ai/kling-video/v1.5/pro/image-to-video", {
        input: {
          image_url: imageUrl,
          prompt,
          duration,
          aspect_ratio: aspectRatio,
        },
      }) as { video: { url: string } };
      
      return result.video.url;
    } catch (error: unknown) {
      const errorDetails = error instanceof Error ? error.message : String(error);
      const dataDetails = (error as { data?: unknown })?.data;
      console.error("[MediaGen] Kling Video Error details:", dataDetails || errorDetails);
      throw error;
    }
  }
}
