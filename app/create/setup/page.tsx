"use client";

import { ProductSetupStep } from "../_components/product-setup-step";
import { StepNavigation } from "../_components/step-navigation";
import { useProductInfo } from "../_hooks/useProductInfo";

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
    handleFileInput
  } = useProductInfo();

  return (
    <>
      <ProductSetupStep
        productName={product_name}
        setProductName={set_product_name}
        description={product_description}
        setDescription={set_product_description}
        productLink={productLink}
        setProductLink={setProductLink}
        handleFetchLink={handleFetchLink}
        fetchLinkLoading={fetchLinkMutation.isPending}
        linkFeedback={linkFeedback}
        fetchedProductLinks={fetchedProductLinks}
        imageFiles={imageFiles}
        removeImage={removeImage}
        previewUrls={previewUrls}
        setLightboxImage={setLightboxImage}
        handleFileInput={handleFileInput}
      />
      <StepNavigation />
    </>
  );
}
