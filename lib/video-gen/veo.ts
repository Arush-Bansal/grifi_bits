import { VideoGenerator, VideoGenerationOptions } from "./types";
import { GoogleAuth } from "google-auth-library";
import { uploadFileFromBuffer } from "../supabase/storage";

export class VeoVideoGenerator implements VideoGenerator {
  id = "models/veo-3.0-fast-generate-001";
  private projectId: string;
  private location: string;
  private endpoint: string;
  private auth: GoogleAuth;

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || "";
    this.location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

    this.endpoint = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/veo-3.0-fast-generate-001:predictLongRunning`;

    this.auth = new GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: "https://www.googleapis.com/auth/cloud-platform",
    });
  }

  async getAccessToken(): Promise<string> {
    const client = await this.auth.getClient();
    const tokenResponse = await client.getAccessToken();
    return tokenResponse.token || "";
  }

  async generate(options: VideoGenerationOptions): Promise<string> {
    const { imageUrl, prompt } = options;

    console.log(
      `[MediaGen] Generating video with Google Veo 3 (Long Running): ${prompt.slice(0, 50)}...`
    );

    if (!this.projectId) {
      console.warn(
        "[MediaGen] GOOGLE_CLOUD_PROJECT_ID is not set. Falling back to mock URL for Veo."
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
    }

    try {
      const token = await this.getAccessToken();

      let imageBase64 = "";
      let mimeType = "image/jpeg";

      if (imageUrl.startsWith("http")) {
        const imageRes = await fetch(imageUrl);
        const contentType = imageRes.headers.get("content-type");
        if (contentType) {
          mimeType = contentType;
        }
        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        imageBase64 = buffer.toString("base64");
      } else if (imageUrl.startsWith("data:image")) {
        const match = imageUrl.match(/^data:([^;]+);base64,/);
        if (match) {
          mimeType = match[1];
        }
        imageBase64 = imageUrl.split(",")[1];
      }

      const requestBody = {
        instances: [
          {
            prompt: prompt,
            image: {
              bytesBase64Encoded: imageBase64,
              mimeType: mimeType,
            },
          },
        ],
        parameters: {
          sampleCount: 1,
        },
      };

      console.log("[MediaGen] Starting Veo generation...");
      const startRes = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`[MediaGen] Veo Start Status: ${startRes.status}`);
      // Log headers - convert to object for JSON.stringify
      const headers: Record<string, string> = {};
      startRes.headers.forEach((v, k) => headers[k] = v);
      console.log(`[MediaGen] Veo Start Headers: ${JSON.stringify(headers)}`);

      if (!startRes.ok) {
        const errText = await startRes.text();
        throw new Error(
          `Veo API Start Error: ${startRes.status} ${startRes.statusText} - ${errText}`
        );
      }

      const op = await startRes.json();
      console.log(`[MediaGen] Veo Start Body: ${JSON.stringify(op)}`);
      const operationName = op.name;
      const operationId = operationName.split("/").pop();
      const pollUrl = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/operations/${operationId}`;
      
      console.log(`[MediaGen] Will poll: ${pollUrl}`);

      const client = await this.auth.getClient();

      // Polling loop
      let done = false;
      let videoGcsUri = "";
      let pollCount = 0;
      const maxPolls = 60; // 5 minutes max (5s * 60)

      while (!done && pollCount < maxPolls) {
        pollCount++;
        console.log(`[MediaGen] Polling Veo... attempt ${pollCount}`);
        
        await new Promise((resolve) => setTimeout(resolve, 8000));

        try {
            const pollRes = await client.request<{
                done?: boolean, 
                error?: Record<string, unknown>, 
                response?: {videos?: {uri?: string, gcsUri?: string}[]}
            }>({
                url: pollUrl,
                method: 'GET'
            });

            const data = pollRes.data;
            if (data.error) {
                console.error(`[MediaGen] Veo Polling Error data:`, JSON.stringify(data.error));
                throw new Error(`Veo Polling Error: ${JSON.stringify(data.error)}`);
            }

            if (data.done) {
                done = true;
                videoGcsUri = data.response?.videos?.[0]?.uri || data.response?.videos?.[0]?.gcsUri || "";
                
                if (videoGcsUri) {
                    console.log(`[MediaGen] Poll SUCCESS: Video generated at ${videoGcsUri}`);
                } else {
                    console.warn(`[MediaGen] Veo job done but no video URI found: ${JSON.stringify(data)}`);
                    throw new Error("No video URI in done response");
                }
            } else {
                console.log(`[MediaGen] Veo job still in progress (done=false)`);
            }
        } catch (pollError: unknown) {
            const msg = pollError instanceof Error ? pollError.message : String(pollError);
            console.warn(`[MediaGen] Poll attempt ${pollCount} failed: ${msg}. Continuing...`);
            // We continue polling as long as maxPolls isn't reached, in case of transient errors
        }
      }

      if (!done) {
        throw new Error("Veo generation timed out after 5 minutes");
      }

      console.log(`[MediaGen] Veo generation complete. GCS URI: ${videoGcsUri}`);

      // Download from GCS
      // gs://bucket-name/object-name -> https://storage.googleapis.com/storage/v1/b/bucket-name/o/object-name?alt=media
      const gcsPath = videoGcsUri.replace("gs://", "");
      const bucketName = gcsPath.split("/")[0];
      const objectName = encodeURIComponent(gcsPath.split("/").slice(1).join("/"));
      const downloadUrl = `https://storage.googleapis.com/storage/v1/b/${bucketName}/o/${objectName}?alt=media`;

      console.log(`[MediaGen] Downloading video from GCS...`);
      const downloadRes = await fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!downloadRes.ok) {
          const errText = await downloadRes.text();
          throw new Error(`Failed to download video from GCS: ${downloadRes.status} - ${errText}`);
      }

      const videoBuffer = Buffer.from(await downloadRes.arrayBuffer());
      console.log(`[MediaGen] Downloaded ${videoBuffer.length} bytes.`);

      // Upload to Supabase
      const fileName = `veo_${Date.now()}_${Math.random().toString(36).substring(2)}.mp4`;
      console.log(`[MediaGen] Uploading to Supabase as ${fileName}...`);
      
      const publicUrl = await uploadFileFromBuffer(videoBuffer, fileName, "video/mp4");
      
      if (!publicUrl) {
        throw new Error("Failed to upload Veo video to Supabase");
      }

      console.log(`[MediaGen] Veo success! Final URL: ${publicUrl}`);
      return publicUrl;

    } catch (error: unknown) {
      console.error("[MediaGen] Veo Video Error details:", error);
      throw error;
    }
  }
}
