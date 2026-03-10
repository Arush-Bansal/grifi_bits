export interface VideoGenerationOptions {
  imageUrl: string;
  prompt: string;
  duration?: number;
  aspectRatio?: "16:9" | "9:16" | "1:1";
}

export interface VideoGenerator {
  id: string;
  generate(options: VideoGenerationOptions): Promise<string>;
}
