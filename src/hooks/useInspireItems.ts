"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  getDefaultInspireItems,
  mergeInspireItems,
  type InspireItemsContent,
  type InspireItemsPageKey,
} from "@/lib/content/inspireItems";

export function useInspireItems<T extends InspireItemsContent>(
  page: InspireItemsPageKey
): T {
  const [items, setItems] = useState<InspireItemsContent>(
    getDefaultInspireItems(page)
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/content/${page}`);
        const data = res.data?.data;
        if (!cancelled && data) {
          setItems(mergeInspireItems(page, data.items));
        }
      } catch {
        // keep defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

  return items as T;
}
