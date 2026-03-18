"use client";

import { useProductInfo } from "../_hooks/useProductInfo";

import { StepNavigation } from "../_components/step-navigation";
import { ProductBasicInfo } from "./_components/ProductBasicInfo";
import { UploadedImagesGrid } from "./_components/UploadedImagesGrid";
import { ProductImageUpload } from "./_components/ProductImageUpload"; // Added this import for ProductImageUpload


export default function SetupPage() {
  const {
    product_name,
    set_product_name,
    product_description,
    set_product_description,
    imageFiles,
    removeImage,
    previewUrls,
    setLightboxImage,
    handleFileInput,
  } = useProductInfo();


  return (
    <>

      
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-6">
          <ProductBasicInfo
            productName={product_name}
            setProductName={set_product_name}
            productDescription={product_description}
            setProductDescription={set_product_description}
          />

          <ProductImageUpload handleFileInput={handleFileInput} />
        </div>

        <UploadedImagesGrid
          previewUrls={previewUrls}
          imageFiles={imageFiles}
          setLightboxImage={setLightboxImage}
          removeImage={removeImage}
        />
      </div>


      <StepNavigation />
    </>
  );
}
