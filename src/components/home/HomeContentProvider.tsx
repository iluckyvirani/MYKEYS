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

export function HomeContentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [content, setContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/content/home");
      if (res.data?.success && res.data.data) {
        setContent({ ...DEFAULT_HOME_CONTENT, ...res.data.data });
      }
    } catch {
      setContent(DEFAULT_HOME_CONTENT);
    } finally {
      setLoading(false);
    }
  }, []);

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
