"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { openCookieSettings } from "@/lib/cookieConsent";

export default function CookiesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-[72px] md:pt-[80px]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Cookie Policy
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed">
            MYKEYS uses cookies and similar technologies to keep the site secure,
            remember your preferences, and (with your consent) improve the
            experience and measure performance.
          </p>

          <section className="mt-10 space-y-6 text-gray-700 leading-relaxed">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Necessary</h2>
              <p className="mt-2">
                Required for core features such as authentication, security, and
                load balancing. These cannot be turned off.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Analytics</h2>
              <p className="mt-2">
                Help us understand how visitors use MYKEYS so we can improve pages
                and search. Used only if you accept analytics cookies.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Marketing</h2>
              <p className="mt-2">
                Used to deliver more relevant advertising and measure campaigns.
                Used only if you accept marketing cookies.
              </p>
            </div>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => openCookieSettings()}
              className="h-11 px-5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
            >
              Manage cookie settings
            </button>
            <Link
              href="/privacy"
              className="h-11 px-5 rounded-lg border border-gray-300 text-slate-900 font-semibold inline-flex items-center hover:bg-gray-50 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
