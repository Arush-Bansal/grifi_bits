import axios from "axios";
import { Scene } from "../types";
import { useAppMutation, AppMutationOptions } from "../../_hooks/use-app-mutation";
import { TemplateId } from "@/lib/template-catalog";

interface RemotionRenderParams {
  productDemoData: {
    scenes: Scene[];
    productName: string;
    brandColor?: string;
    templateId?: TemplateId;
  };
}

export const useRemotionRenderMutation = (options?: AppMutationOptions<{ videoUrl: string }, Error, RemotionRenderParams>) => {
  return useAppMutation({
    mutationFn: async (params: RemotionRenderParams) => {
      const { data } = await axios.post("/api/render/remotion", params);
      return data;
    },
    ...options
  });
};
