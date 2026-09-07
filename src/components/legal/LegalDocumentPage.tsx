"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { api } from "@/lib/api";
import {
  DEFAULT_COOKIES_CONTENT,
  DEFAULT_PRIVACY_CONTENT,
  DEFAULT_TERMS_CONTENT,
  LegalPageContent,
} from "@/lib/content/siteDefaults";

const DEFAULTS: Record<"privacy" | "terms" | "cookies", LegalPageContent> = {
  privacy: DEFAULT_PRIVACY_CONTENT,
  terms: DEFAULT_TERMS_CONTENT,
  cookies: DEFAULT_COOKIES_CONTENT,
};

type LegalPageKey = keyof typeof DEFAULTS;

export default function LegalDocumentPage({
  page,
  relatedLinks,
}: {
  page: LegalPageKey;
  relatedLinks?: { href: string; label: string }[];
}) {
  const [content, setContent] = useState<LegalPageContent>(DEFAULTS[page]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/content/${page}`);
        const main = res.data?.data?.main;
        if (!cancelled && main) {
          setContent({ ...DEFAULTS[page], ...main });
        }
      } catch {
        // keep defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-[72px] md:pt-[80px]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            {content.title}
          </h1>
          {content.lastUpdated ? (
            <p className="mt-2 text-sm text-gray-500">
              Last updated: {content.lastUpdated}
            </p>
          ) : null}
          {content.intro ? (
            <p className="mt-4 text-gray-600 leading-relaxed">{content.intro}</p>
          ) : null}

          <section className="mt-10 space-y-8 text-gray-700 leading-relaxed">
            {(content.sections ?? []).map((section, i) => (
              <div key={`${section.heading}-${i}`}>
                <h2 className="text-xl font-semibold text-slate-900">
                  {section.heading}
                </h2>
                <p className="mt-2 whitespace-pre-line">{section.body}</p>
              </div>
            ))}
          </section>

          {relatedLinks && relatedLinks.length > 0 ? (
            <div className="mt-10 flex flex-wrap gap-3">
              {relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="h-11 px-5 rounded-lg border border-gray-300 text-slate-900 font-semibold inline-flex items-center hover:bg-gray-50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
