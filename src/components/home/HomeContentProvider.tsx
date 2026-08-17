"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/lib/api";
import {
  DEFAULT_HOME_CONTENT,
  HomeContent,
} from "@/lib/content/homeDefaults";

const HomeContentContext = createContext<{
  content: HomeContent;
  loading: boolean;
}>({ content: DEFAULT_HOME_CONTENT, loading: true });

function mergeHomeContent(data: Partial<HomeContent> | undefined): HomeContent {
  if (!data) return DEFAULT_HOME_CONTENT;
  return {
    ...DEFAULT_HOME_CONTENT,
    ...data,
    hero: { ...DEFAULT_HOME_CONTENT.hero, ...data.hero },
    categories: { ...DEFAULT_HOME_CONTENT.categories, ...data.categories },
    featured: { ...DEFAULT_HOME_CONTENT.featured, ...data.featured },
    testimonials: {
      ...DEFAULT_HOME_CONTENT.testimonials,
      ...data.testimonials,
    },
    stats: { ...DEFAULT_HOME_CONTENT.stats, ...data.stats },
    faq: { ...DEFAULT_HOME_CONTENT.faq, ...data.faq },
  };
}

export function HomeContentProvider({
  children,
  initialContent,
}: {
  children: React.ReactNode;
  initialContent?: HomeContent;
}) {
  const hasInitial = Boolean(initialContent);
  const [content, setContent] = useState<HomeContent>(
    initialContent ?? DEFAULT_HOME_CONTENT
  );
  // No loading flash when server already provided CMS content
  const [loading, setLoading] = useState(!hasInitial);

  const load = useCallback(async () => {
    // Soft revalidate in background when we already have SSR content
    if (!hasInitial) setLoading(true);
    try {
      const res = await api.get("/content/home");
      if (res.data?.success && res.data.data) {
        setContent(mergeHomeContent(res.data.data));
      }
    } catch {
      if (!hasInitial) setContent(DEFAULT_HOME_CONTENT);
    } finally {
      setLoading(false);
    }
  }, [hasInitial]);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(() => ({ content, loading }), [content, loading]);

  return (
    <HomeContentContext.Provider value={value}>
      {children}
    </HomeContentContext.Provider>
  );
}

export function useHomeContent() {
  return useContext(HomeContentContext);
}
