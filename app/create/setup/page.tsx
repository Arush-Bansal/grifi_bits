"use client";

import { useProductInfo } from "../_hooks/useProductInfo";
import { useAiPlan } from "../_hooks/useAiPlan";
import { StepNavigation } from "../_components/step-navigation";
import { ProductBasicInfo } from "./_components/ProductBasicInfo";
import { ProductLinkFetcher } from "./_components/ProductLinkFetcher";
import { ProductImageUpload } from "./_components/ProductImageUpload";
import { VideoSettingsSidebar } from "./_components/VideoSettingsSidebar";
import { UploadedImagesGrid } from "./_components/UploadedImagesGrid";

export default function SetupPage() {
  const {
    product_name,
    set_product_name,
    product_description,
    set_product_description,
    productLink,
    setProductLink,
    pinCode,
    setPinCode,
    handleFetchLink,
    fetchLinkMutation,
    linkFeedback,
    fetchedProductLinks,
    imageFiles,
    removeImage,
    previewUrls,
    setLightboxImage,
    handleFileInput,
  } = useProductInfo();

  const { settings, setSettings } = useAiPlan();

  return (
    <>
      <div className="grid gap-7 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5 min-w-0">
          <ProductBasicInfo
            productName={product_name}
            setProductName={set_product_name}
            productDescription={product_description}
            setProductDescription={set_product_description}
          />

          <ProductLinkFetcher
            productLink={productLink}
            setProductLink={setProductLink}
            pinCode={pinCode}
            setPinCode={setPinCode}
            handleFetchLink={handleFetchLink}
            isPending={fetchLinkMutation.isPending}
            linkFeedback={linkFeedback}
            fetchedProductLinks={fetchedProductLinks}
          />

          <ProductImageUpload handleFileInput={handleFileInput} />
        </div>

        <VideoSettingsSidebar 
          settings={settings}
          setSettings={setSettings}
        />
      </div>

      <UploadedImagesGrid
        previewUrls={previewUrls}
        imageFiles={imageFiles}
        setLightboxImage={setLightboxImage}
        removeImage={removeImage}
      />

      <StepNavigation />
    </>
  );
}
