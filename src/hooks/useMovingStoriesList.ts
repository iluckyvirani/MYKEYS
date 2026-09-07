"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  DEFAULT_MOVING_STORIES_LIST,
  mergeMovingStoriesList,
  type MovingStoriesSectionContent,
} from "@/lib/movingStories";

export function useMovingStoriesList(): MovingStoriesSectionContent {
  const [stories, setStories] = useState<MovingStoriesSectionContent>(
    DEFAULT_MOVING_STORIES_LIST
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/content/moving-stories");
        const data = res.data?.data;
        if (!cancelled && data) {
          setStories(mergeMovingStoriesList(data.stories));
        }
      } catch {
        // keep defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return stories;
}
