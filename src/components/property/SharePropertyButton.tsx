"use client";

import { useState } from "react";
import { Share2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sharePropertyListing } from "@/lib/shareProperty";
import { cn } from "@/lib/utils";

type Variant = "icon" | "outline" | "overlay";

interface SharePropertyButtonProps {
  propertyId: string;
  title: string;
  variant?: Variant;
  className?: string;
  label?: string;
}

export default function SharePropertyButton({
  propertyId,
  title,
  variant = "icon",
  className,
  label = "Share",
}: SharePropertyButtonProps) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    setBusy(true);
    try {
      const result = await sharePropertyListing({ id: propertyId, title });
      if (result === "copied") {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } finally {
      setBusy(false);
    }
  };

  if (variant === "overlay") {
    return (
      <button
        type="button"
        onClick={handleShare}
        disabled={busy}
        title={copied ? "Link copied!" : "Share property"}
        aria-label={copied ? "Link copied" : "Share property"}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-gray-800 shadow-sm border border-white/80 hover:bg-white cursor-pointer disabled:opacity-60",
          className
        )}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleShare}
      disabled={busy}
      title={copied ? "Link copied!" : "Share public listing link"}
      className={cn(
        "rounded-[5px] cursor-pointer",
        variant === "icon" && "h-8 w-8 p-0",
        className
      )}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Share2 className={cn("h-4 w-4", variant === "outline" && "mr-1")} />
      )}
      {variant === "outline" && (
        <span>{copied ? "Copied" : label}</span>
      )}
    </Button>
  );
}
