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
    <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-sm space-y-6">
      <div className="space-y-3">
        <Label htmlFor="product-name" className="text-sm font-bold tracking-tight text-foreground/80">Product name *</Label>
        <Input
          id="product-name"
          placeholder="HydraGlow Face Mist"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="h-12 border-border/50 bg-background/50 focus:border-primary/50 focus:ring-primary/20"
          required
        />
      </div>
      <div className="space-y-3">
        <Label htmlFor="description" className="text-sm font-bold tracking-tight text-foreground/80">Describe your product *</Label>
        <Textarea
          id="description"
          placeholder="Give details: audience, offer, tone, outcomes..."
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          className="min-h-[160px] border-border/50 bg-background/50 focus:border-primary/50 focus:ring-primary/20 resize-none"
          required
        />
      </div>
    </div>
  );
}
