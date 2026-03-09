"use client";

import { ProductSetupStep } from "../_components/product-setup-step";
import { StepNavigation } from "../_components/step-navigation";
import { useCreatePageContext } from "../_context/CreatePageContext";

export default function SetupPage() {
  const state = useCreatePageContext();

  return (
    <>
      <ProductSetupStep
        productName={state.productName}
        setProductName={state.setProductName}
        description={state.description}
        setDescription={state.setDescription}
        productLink={state.productLink}
        setProductLink={state.setProductLink}
        handleFetchLink={state.handleFetchLink}
        fetchLinkLoading={state.fetchLinkMutation.isPending}
        linkFeedback={state.linkFeedback}
        fetchedProductLinks={state.fetchedProductLinks}
        imageFiles={state.imageFiles}
        removeImage={state.removeImage}
        previewUrls={state.previewUrls.map((p: { url: string }) => p.url)}
        setLightboxImage={state.setLightboxImage}
        handleFileInput={state.handleFileInput}
      />
      <StepNavigation />
    </>
  );
}
