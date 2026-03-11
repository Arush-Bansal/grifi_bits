"use client";

import { useProductInfo } from "../_hooks/useProductInfo";
import { StepNavigation } from "../_components/step-navigation";
import { ProductBasicInfo } from "./_components/ProductBasicInfo";
import { ProductLinkFetcher } from "./_components/ProductLinkFetcher";
import { ProductImageUpload } from "./_components/ProductImageUpload";
import { CreativeBriefSnapshot } from "./_components/CreativeBriefSnapshot";
import { UploadedImagesGrid } from "./_components/UploadedImagesGrid";

export default function SetupPage() {
  const {
    product_name,
    set_product_name,
    product_description,
    set_product_description,
    productLink,
    setProductLink,
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
            handleFetchLink={handleFetchLink}
            isPending={fetchLinkMutation.isPending}
            linkFeedback={linkFeedback}
            fetchedProductLinks={fetchedProductLinks}
          />

          <ProductImageUpload handleFileInput={handleFileInput} />
        </div>

        <CreativeBriefSnapshot
          productName={product_name}
          previewCount={previewUrls.length}
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
