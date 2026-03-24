import React from "react";
import { renderMediaOnWeb, RenderMediaOnWebProgress } from "@remotion/web-renderer";
import { resolveTemplateConfig } from "@/remotion/template-registry";
import { TemplateId } from "@/lib/template-catalog";
import { supabaseClient } from "@/lib/supabase/client";

import { Scene } from "@/app/create/types";

export interface ClientRenderParams {
  scenes: Scene[];
  productName: string;
  brandColor?: string;
  templateId: TemplateId;
  onProgress?: (progress: number) => void;
}

export async function renderProductDemoOnClient({
  scenes,
  productName,
  brandColor,
  templateId,
  onProgress,
}: ClientRenderParams): Promise<string> {
  console.log(`[ClientRender] Starting render for ${templateId}...`);

  // 1. Resolve composition metadata
  const config = resolveTemplateConfig(templateId);
  const fps = 30;
  
  // Replication of Root.tsx duration logic for consistency
  let durationInFrames = 0;
  if (templateId === "MainAd" || templateId === "MainAdLandscape") {
    const isLandscape = templateId === "MainAdLandscape";
    scenes.forEach((scene: Scene) => {
      const tid = scene.template_id || (isLandscape ? "ProductDemo" : "ProductDemoVertical");
      const sc = resolveTemplateConfig(tid as TemplateId);
      durationInFrames += Math.round(sc.sceneDurationSeconds * fps);
    });
  } else {
    durationInFrames = Math.round(config.sceneDurationSeconds * scenes.length * fps);
  }
  
  durationInFrames = Math.max(fps, durationInFrames);

  const inputProps = {
    scenes,
    productName,
    brandColor,
  };

  try {
    // 2. Perform the in-browser render
    const result = await renderMediaOnWeb({
      composition: {
        id: templateId,
        width: config.width,
        height: config.height,
        fps: fps,
        durationInFrames: durationInFrames,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component: config.component as React.ComponentType<any>,
        defaultProps: inputProps,
      },
      inputProps,
      onProgress: (p: RenderMediaOnWebProgress) => {
        onProgress?.(p.progress);
      },
    });

    console.log("[ClientRender] Rendering complete, getting blob...");
    const blob = await result.getBlob();
    
    // 3. Upload directly to Supabase Storage from the client
    if (!supabaseClient) {
      throw new Error("Supabase client not initialized. Check your environment variables.");
    }
    
    const fileName = `demo-${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`;
    const filePath = `renders/${fileName}`;
    
    console.log(`[ClientRender] Uploading to Supabase: ${filePath}`);
    const { error } = await supabaseClient.storage
      .from("orbit-assets")
      .upload(filePath, blob, {
        contentType: "video/mp4",
        upsert: true,
      });
      
    if (error) {
      console.error("[ClientRender] Supabase upload error:", error);
      throw error;
    }
    
    const { data: { publicUrl } } = supabaseClient.storage
      .from("orbit-assets")
      .getPublicUrl(filePath);
      
    console.log(`[ClientRender] Rendered and uploaded successfully: ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.error("[ClientRender] Fatal error during CSR:", err);
    throw err;
  }
}
