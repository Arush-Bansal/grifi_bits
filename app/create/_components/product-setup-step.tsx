"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, Trash2 } from "lucide-react";
import Image from "next/image";

interface ProductSetupStepProps {
  productName: string;
  setProductName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  productLink: string;
  setProductLink: (val: string) => void;
  handleFetchLink: () => void;
  fetchLinkLoading: boolean;
  linkFeedback: string;
  fetchedProductLinks: string[];
  imageFiles: File[];
  previewUrls: string[];
  setLightboxImage: (url: string | null) => void;
  handleFileInput: (files: FileList | null) => void;
  removeImage: (index: number) => void;
}

export function ProductSetupStep({
  productName,
  setProductName,
  description,
  setDescription,
  productLink,
  setProductLink,
  handleFetchLink,
  fetchLinkLoading,
  linkFeedback,
  fetchedProductLinks,
  imageFiles,
  removeImage,
  previewUrls,
  setLightboxImage,
  handleFileInput
}: ProductSetupStepProps) {
  return (
    <>
      <div className="grid gap-7 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5 min-w-0">
          <div className="space-y-2">
            <Label htmlFor="product-name">Product name *</Label>
            <Input
              id="product-name"
              placeholder="HydraGlow Face Mist"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Describe your product *</Label>
            <Textarea
              id="description"
              placeholder="Give details: audience, offer, tone, outcomes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[160px]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-link">Fetch product info (optional)</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="product-link"
                value={productLink}
                onChange={(e) => setProductLink(e.target.value)}
                placeholder="Paste website, Amazon, or product page URL"
                className="sm:flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleFetchLink}
                className="sm:min-w-28"
                disabled={fetchLinkLoading}
              >
                {fetchLinkLoading ? "Fetching..." : "Fetch"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground break-words">{linkFeedback}</p>
            {fetchedProductLinks.length > 0 && (
              <div className="rounded-lg border border-border/70 bg-background/70 p-3 overflow-hidden">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Fetched sources ({fetchedProductLinks.length}) - you can add more
                </p>
                <ul className="mt-2 space-y-1">
                  {fetchedProductLinks.map((link, index) => (
                    <li key={`${link}-${index}`} className="truncate text-xs text-foreground">
                      {index + 1}. {link}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="rounded-xl border border-dashed border-primary/40 bg-secondary/30 p-5">
            <Label htmlFor="images" className="mb-2 block">
              Upload product images
            </Label>
            <label
              htmlFor="images"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-background/80 px-4 py-3 text-sm text-muted-foreground"
            >
              <UploadCloud className="h-4 w-4" />
              Select up to 8 images
            </label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileInput(e.target.files)}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-[#dff2ff] to-[#eff7ff] p-5">
          <h2 className="text-base font-semibold">Creative Brief Snapshot</h2>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">* Required fields</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Your brief will feed the script, scene prompts, and voice style in the next steps.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <p>
              <span className="font-semibold">Brand:</span> {productName || "Not set"}
            </p>
            <p>
              <span className="font-semibold">Assets:</span> {imageFiles.length} uploaded
            </p>
            <p>
              <span className="font-semibold">Tone:</span> UGC conversion focused
            </p>
          </div>
        </div>
      </div>

      {previewUrls.length > 0 && (
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
                  onClick={() => setLightboxImage(url)}
                  className="relative h-full w-full block cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Image
                    src={url}
                    alt={imageFiles[index]?.name ?? `upload-${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
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
      )}
    </>
  );
}
