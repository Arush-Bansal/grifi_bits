"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Link2 } from "lucide-react";

interface ProductLinkFetcherProps {
  productLink: string;
  setProductLink: (val: string) => void;
  pinCode: string;
  setPinCode: (val: string) => void;
  handleFetchLink: () => void;
  isPending: boolean;
  linkFeedback: string;
  fetchedProductLinks: string[];
}

export function ProductLinkFetcher({
  productLink,
  setProductLink,
  pinCode,
  setPinCode,
  handleFetchLink,
  isPending,
  linkFeedback,
  fetchedProductLinks,
}: ProductLinkFetcherProps) {
  const isLocationRequired = productLink.toLowerCase().includes("blinkit") || productLink.toLowerCase().includes("zepto");

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-sm transition-all">
      <div className="relative space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Link2 className="h-4 w-4" />
          </div>
          <div>
            <Label htmlFor="product-link" className="text-sm font-bold tracking-tight text-foreground/80">
              Import from Link
            </Label>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              AUTO-FILL NAME, DESCRIPTION & IMAGES
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="product-link"
              value={productLink}
              onChange={(e) => setProductLink(e.target.value)}
              placeholder="Paste Amazon, Blinkit, or website link"
              className="h-11 border-border/50 bg-background/50 focus:border-primary/50 focus:ring-primary/20 sm:flex-1"
            />
            <Button
              type="button"
              onClick={handleFetchLink}
              className="h-11 shadow-md shadow-primary/5 transition-all hover:bg-primary active:scale-[0.98] sm:min-w-32"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <Link2 className="mr-2 h-4 w-4" />
                  <span>Fetch Info</span>
                </>
              )}
            </Button>
          </div>
          
          <p className="text-[11px] font-medium text-muted-foreground/60 italic px-1">
            Using a link will automatically fill the product details for you.
          </p>
          
          {isLocationRequired && (
            <div className="flex items-center gap-3 rounded-xl bg-primary/5 p-3 border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-500">
              <Label htmlFor="pin-code" className="text-xs font-bold uppercase tracking-wider text-primary">PIN Code:</Label>
              <Input
                id="pin-code"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="110001"
                className="h-9 w-24 border-primary/20 bg-background/50 text-center font-mono text-sm"
                maxLength={6}
              />
              <span className="text-[10px] font-medium text-muted-foreground italic">Required for local delivery links</span>
            </div>
          )}
        </div>

        {linkFeedback && (
          <p className="px-1 text-[11px] font-medium text-primary italic animate-in fade-in duration-500">
            {linkFeedback}
          </p>
        )}

        {fetchedProductLinks.length > 0 && (
          <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 space-y-3 overflow-hidden animate-in zoom-in-95 duration-500">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary/70">
              IMPORTED SOURCES ({fetchedProductLinks.length})
            </p>
            <ul className="space-y-2">
              {fetchedProductLinks.map((link, index) => (
                <li key={`${link}-${index}`} className="flex items-center gap-2 text-xs text-foreground/80">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[8px] font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="truncate">{link}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
