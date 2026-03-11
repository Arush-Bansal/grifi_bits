"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ProductLinkFetcherProps {
  productLink: string;
  setProductLink: (val: string) => void;
  handleFetchLink: () => void;
  isPending: boolean;
  linkFeedback: string;
  fetchedProductLinks: string[];
}

export function ProductLinkFetcher({
  productLink,
  setProductLink,
  handleFetchLink,
  isPending,
  linkFeedback,
  fetchedProductLinks,
}: ProductLinkFetcherProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="product-link">Fetch product info (optional)</Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="product-link"
          value={productLink}
          onChange={(e) => setProductLink(e.target.value)}
          placeholder="Paste Instagram reel link, website, Amazon, or product page URL"
          className="sm:flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleFetchLink}
          className="sm:min-w-28"
          disabled={isPending}
        >
          {isPending ? "Fetching..." : "Fetch"}
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
  );
}
