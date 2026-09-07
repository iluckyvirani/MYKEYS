"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  DEFAULT_ABOUT_CONTENT,
  AboutPageContent,
  mergeAboutContent,
} from "@/lib/content/aboutDefaults";

export function useAboutContent(): AboutPageContent {
  const [content, setContent] = useState<AboutPageContent>(DEFAULT_ABOUT_CONTENT);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/content/about");
        const data = res.data?.data;
        if (!cancelled && data) {
          setContent(mergeAboutContent(data));
        }
      } catch {
        // keep defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return content;
}
