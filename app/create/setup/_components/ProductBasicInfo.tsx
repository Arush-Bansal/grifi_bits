"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProductBasicInfoProps {
  productName: string;
  setProductName: (val: string) => void;
  productDescription: string;
  setProductDescription: (val: string) => void;
}

export function ProductBasicInfo({
  productName,
  setProductName,
  productDescription,
  setProductDescription,
}: ProductBasicInfoProps) {
  return (
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
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          className="min-h-[160px]"
          required
        />
      </div>
    </div>
  );
}
