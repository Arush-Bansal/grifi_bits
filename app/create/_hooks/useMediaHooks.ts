import { Scene } from "../types";
import { useAppMutation, AppMutationOptions } from "../../_hooks/use-app-mutation";
import { TemplateId } from "@/lib/template-catalog";
import { renderProductDemoOnClient } from "@/lib/remotion-renderer/client-render";

interface RemotionRenderParams {
  productDemoData: {
    scenes: Scene[];
    productName: string;
    brandColor?: string;
    templateId: TemplateId;
  };
  onProgress?: (progress: number) => void;
}

export const useRemotionRenderMutation = (options?: AppMutationOptions<{ videoUrl: string }, Error, RemotionRenderParams>) => {
  return useAppMutation({
    mutationFn: async (params: RemotionRenderParams) => {
      const { productDemoData, onProgress } = params;
      
      const videoUrl = await renderProductDemoOnClient({
        ...productDemoData,
        onProgress,
      });

      return { videoUrl };
    },
    ...options
  });
};
