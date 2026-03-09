"use client";

import { useState, useCallback, useEffect } from "react";
import { uploadImage } from "@/lib/supabase/storage";
import { useFetchLinkMutation } from "./index";

export function useProductInfo() {
  const [productName, setProductName] = useState("");
  const [productLink, setProductLink] = useState("");
  const [fetchedProductLinks, setFetchedProductLinks] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Array<{ name: string; url: string }>>([]);
  const [linkFeedback, setLinkFeedback] = useState("Paste a website, Amazon, or product page URL, then click Fetch.");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const nextUrls = imageFiles.map((file) => URL.createObjectURL(file));
    return () => {
      nextUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);

  const removeImage = useCallback((index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleFileInput = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setImageFiles((prev) => [...prev, ...newFiles].slice(0, 8));

    for (const file of newFiles) {
      const url = await uploadImage(file);
      if (url) {
        setPreviewUrls((prev) => [...prev, { name: file.name, url }]);
      }
    }
  }, []);

  const fetchLinkMutation = useFetchLinkMutation({
    onSuccess: async (data, url) => {
      setProductName(data.title || productName);
      setDescription((prev) => (data.description ? `${prev}\n\n${data.description}` : prev));
      setFetchedProductLinks((prev) => [...new Set([...prev, url])]);
      setLinkFeedback(`Fetched info for ${data.title}.`);
      setProductLink("");

      if (data.imageUrls && data.imageUrls.length > 0) {
        const remainingSlots = 8 - imageFiles.length;
        const imagesToAdd = (data.imageUrls as string[]).slice(0, Math.min(5, remainingSlots));

        if (imagesToAdd.length > 0) {
          setLinkFeedback(`Fetched info for ${data.title}. Loading ${imagesToAdd.length} product images…`);

          const newFiles: File[] = [];
          for (let i = 0; i < imagesToAdd.length; i++) {
            try {
              const dataUri = imagesToAdd[i];
              const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
              if (!match) continue;

              const mime = match[1];
              const b64 = match[2];
              const binary = atob(b64);
              const bytes = new Uint8Array(binary.length);
              for (let j = 0; j < binary.length; j++) {
                bytes[j] = binary.charCodeAt(j);
              }
              const ext = mime.split("/")[1] || "jpg";
              const file = new File([bytes], `product-image-${i + 1}.${ext}`, { type: mime });
              newFiles.push(file);
            } catch (err) {
              console.warn(`Failed to convert image ${i + 1}:`, err);
            }
          }

          if (newFiles.length > 0) {
            setImageFiles((prev) => [...prev, ...newFiles].slice(0, 8));
            for (const file of newFiles) {
              const url = await uploadImage(file);
              if (url) {
                setPreviewUrls((prev) => [...prev, { name: file.name, url }]);
              }
            }
            setLinkFeedback(`Fetched info for ${data.title}. Added ${newFiles.length} product image${newFiles.length > 1 ? "s" : ""}.`);
          }
        }
      }
    },
    onError: (error: Error) => {
      const axiosError = error as { response?: { data?: { error?: string } } };
      const message = axiosError.response?.data?.error || error.message || "Failed to fetch link.";
      setLinkFeedback(message);
    }
  });

  const handleFetchLink = useCallback(() => {
    const trimmed = productLink.trim();
    if (!trimmed) {
      setLinkFeedback("Add a product page URL to fetch product info.");
      return;
    }
    const normalizedLink = trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`;
    try {
      new URL(normalizedLink);
    } catch {
      setLinkFeedback("Please enter a valid URL.");
      return;
    }
    if (fetchedProductLinks.includes(normalizedLink)) {
      setLinkFeedback("This product URL is already fetched.");
      return;
    }
    fetchLinkMutation.mutate(normalizedLink);
  }, [productLink, fetchedProductLinks, fetchLinkMutation]);

  return {
    productName, setProductName,
    productLink, setProductLink,
    fetchedProductLinks,
    description, setDescription,
    imageFiles, setImageFiles,
    previewUrls, setPreviewUrls,
    removeImage,
    handleFileInput,
    handleFetchLink,
    fetchLinkMutation,
    linkFeedback,
    lightboxImage, setLightboxImage
  };
}
