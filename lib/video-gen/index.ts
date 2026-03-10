import { VeoVideoGenerator } from "./veo";
import { KlingVideoGenerator } from "./kling";
import { VideoGenerator } from "./types";

// Export the generators so they can be explicitly chosen if needed
export { VeoVideoGenerator, KlingVideoGenerator };
export type { VideoGenerator, VideoGenerationOptions } from "./types";

// By default we wrap it to use Veo if configured, otherwise fallback to Kling
export const currentVideoGenerator: VideoGenerator = new VeoVideoGenerator();
