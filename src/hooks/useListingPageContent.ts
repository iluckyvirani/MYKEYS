"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  getDefaultListingContent,
  ListingPageContent,
  ListingPageKey,
} from "@/lib/content/siteDefaults";

export function useListingPageContent(page: ListingPageKey): ListingPageContent {
  const defaults = getDefaultListingContent(page);
  const [content, setContent] = useState<ListingPageContent>(defaults);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/content/${page}`);
        const data = res.data?.data;
        if (!cancelled && data) {
          setContent({
            hero: { ...defaults.hero, ...(data.hero || {}) },
            howItWorks: {
              ...defaults.howItWorks,
              ...(data.howItWorks || {}),
              stats:
                Array.isArray(data.howItWorks?.stats) &&
                data.howItWorks.stats.length > 0
                  ? data.howItWorks.stats
                  : defaults.howItWorks.stats,
            },
            faq: { ...defaults.faq, ...(data.faq || {}) },
          });
        }
      } catch {
        // keep defaults
      }
    })();
    return () => {
      cancelled = true;
    };
    // defaults is stable per page key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return content;
}
