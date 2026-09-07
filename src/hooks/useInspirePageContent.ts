"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  getDefaultInspireContent,
  InspirePageContent,
  InspirePageKey,
} from "@/lib/content/inspireDefaults";

export function useInspirePageContent(
  page: InspirePageKey
): InspirePageContent {
  const defaults = getDefaultInspireContent(page);
  const [content, setContent] = useState<InspirePageContent>(defaults);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/content/${page}`);
        const data = res.data?.data;
        if (!cancelled && data) {
          setContent({
            hero: { ...defaults.hero, ...(data.hero || {}) },
            ...(defaults.sidebar || data.sidebar
              ? {
                  sidebar: {
                    ...(defaults.sidebar || {
                      title: "",
                      body: "",
                      buttonLabel: "",
                    }),
                    ...(data.sidebar || {}),
                  },
                }
              : {}),
          });
        }
      } catch {
        // keep defaults
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return content;
}
