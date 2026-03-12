"use client";

import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useFetchLinkMutation } from "./index";
import { useProject } from "./useProject";
import { useUIState } from "./useUIState";

export function useProductInfo() {
  const { projectData, updateCache } = useProject();
  const { lightboxImage, setLightboxImage } = useUIState();
  
  const [productLink, setProductLink] = useState("");
  const [fetchedProductLinks, setFetchedProductLinks] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Array<{ name: string; url: string }>>([]);
  const [linkFeedback, setLinkFeedback] = useState("Paste a website, Amazon, or product page URL, then click Fetch.");

  useEffect(() => {
    if (projectData?.references) {
      const uploadedItems = projectData.references
        .filter((r) => r.image_url && typeof r.image_url === 'string' && (r.image_url.includes("supabase") || r.image_url.startsWith("http")) || r.original_name)
        .map((r) => ({ name: r.original_name || r.label, url: r.image_url }));
      setPreviewUrls(uploadedItems);
    }
  }, [projectData?.references]);

  useEffect(() => {
    if (projectData?.settings?.product_urls) {
      setFetchedProductLinks(projectData.settings.product_urls);
    }
  }, [projectData?.settings?.product_urls]);

  useEffect(() => {
    const nextUrls = imageFiles.map((file) => URL.createObjectURL(file));
    return () => {
      nextUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);

  const removeImage = useCallback((index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Persist the removal to the project cache
      updateCache({
        references: updated
          .filter(p => !p.url.startsWith("blob:")) // Safeguard
          .map(p => ({
            id: p.name,
            label: p.name,
            tagline: "",
            image_url: p.url,
            original_name: p.name
          }))
      });
      return updated;
    });
  }, [updateCache]);

  const handleFileInput = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    
    // Create a FormData to send files to the server
    const formData = new FormData();
    newFiles.forEach((file) => formData.append("files", file));

    try {
      setLinkFeedback("Uploading images…");
      const { data } = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.urls && data.urls.length > 0) {
        const newPreviewItems = data.urls.map((url: string, i: number) => ({
          name: newFiles[i]?.name || `upload-${i + 1}`,
          url,
        }));
        const updatedPreviewUrls = [...previewUrls, ...newPreviewItems].slice(0, 8);
        setPreviewUrls(updatedPreviewUrls);
        
        // Update cache so these permanent URLs are persisted
        updateCache({
          references: updatedPreviewUrls
            .filter(p => !p.url.startsWith("blob:")) // Safeguard
            .map(p => ({
              id: p.name,
              label: p.name,
              tagline: "",
              image_url: p.url,
              original_name: p.name
            }))
        });

        setLinkFeedback(`Uploaded ${data.urls.length} images.`);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setLinkFeedback("Failed to upload images.");
    }
  }, [previewUrls, updateCache]);

  const fetchLinkMutation = useFetchLinkMutation({
    onSuccess: async (data, url) => {
      const newName = data.title || projectData?.product_name || "";
      const newDesc = data.description 
        ? `${projectData?.product_description || ""}\n\n${data.description}`.trim()
        : projectData?.product_description || "";

      setFetchedProductLinks((prev) => [...new Set([...prev, url])]);
      setProductLink("");

      if (data.imageUrls && data.imageUrls.length > 0) {
        const remainingSlots = 8 - previewUrls.length;
        const imagesToAdd = (data.imageUrls as string[]).slice(0, Math.min(5, remainingSlots));

        if (imagesToAdd.length > 0) {
          const newPreviewItems = imagesToAdd.map((imgUrl, i) => ({
            name: `product-image-${Date.now()}-${i + 1}`,
            url: imgUrl,
          }));

          const updatedPreviewUrls = [...previewUrls, ...newPreviewItems].slice(0, 8);
          setPreviewUrls(updatedPreviewUrls);

          const currentLinks = projectData?.settings?.product_urls || [];
          const newLinks = [...new Set([...currentLinks, url])];

          // Update cache with everything including new references and newly fetched URL
          updateCache({
            product_name: newName,
            product_description: newDesc,
            settings: {
              ...(projectData?.settings || { orientation: "portrait", duration: 15, logo_ending: true, language: "en", captions_enabled: true }),
              product_urls: newLinks
            },
            references: updatedPreviewUrls
              .filter(p => !p.url.startsWith("blob:")) // Safeguard
              .map(p => ({
                id: p.name,
                label: p.name,
                tagline: "",
                image_url: p.url,
                original_name: p.name
              }))
          });

          setLinkFeedback(`[VERSION 2.1] Successfully fetched info for ${data.title} and added ${imagesToAdd.length} images.`);
        } else {
          const currentLinks = projectData?.settings?.product_urls || [];
          const newLinks = [...new Set([...currentLinks, url])];
          
          updateCache({
            product_name: newName,
            product_description: newDesc,
            settings: {
              ...(projectData?.settings || { orientation: "portrait", duration: 15, logo_ending: true, language: "en", captions_enabled: true }),
              product_urls: newLinks
            },
          });
          setLinkFeedback(`[VERSION 2.1] Successfully fetched info for ${data.title}. No new images added.`);
        }
      } else {
        const currentLinks = projectData?.settings?.product_urls || [];
        const newLinks = [...new Set([...currentLinks, url])];

        updateCache({
          product_name: newName,
          product_description: newDesc,
          settings: {
            ...(projectData?.settings || { orientation: "portrait", duration: 15, logo_ending: true, language: "en", captions_enabled: true }),
            product_urls: newLinks
          },
        });
        setLinkFeedback(`[VERSION 2.1] Successfully fetched info for ${data.title}.`);
      }
    },
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
    product_name: projectData?.product_name || "",
    set_product_name: (val: string) => updateCache({ product_name: val }),
    product_description: projectData?.product_description || "",
    set_product_description: (val: string) => updateCache({ product_description: val }),
    productLink, setProductLink,
    fetchedProductLinks,
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
