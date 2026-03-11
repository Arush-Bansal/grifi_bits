"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";

interface UploadedImagesGridProps {
  previewUrls: Array<{ name: string; url: string }>;
  imageFiles: File[];
  setLightboxImage: (url: string) => void;
  removeImage: (index: number) => void;
}

export function UploadedImagesGrid({
  previewUrls,
  imageFiles,
  setLightboxImage,
  removeImage,
}: UploadedImagesGridProps) {
  if (previewUrls.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="mb-3 text-sm font-semibold">Uploaded images</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {previewUrls.map((url, index) => (
          <div
            key={`${imageFiles[index]?.name ?? "image"}-${index}`}
            className="group relative h-28 overflow-hidden rounded-lg border border-border"
          >
            <button
              type="button"
              onClick={() => setLightboxImage(url.url)}
              className="relative h-full w-full block cursor-pointer hover:opacity-90 transition-opacity"
            >
              <p className="absolute bottom-0 left-0 right-0 z-10 bg-black/50 py-1 text-center text-[10px] text-white backdrop-blur-sm">
                {url.name}
              </p>
              {url.url &&
              typeof url.url === "string" &&
              (url.url.startsWith("http") || url.url.startsWith("blob:") || url.url.startsWith("/")) ? (
                <Image
                  src={url.url}
                  alt={url.name || `upload-${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <span className="text-[10px] text-muted-foreground">Error</span>
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1.5 right-1.5 z-10 rounded-full bg-black/60 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"
              title="Remove image"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
