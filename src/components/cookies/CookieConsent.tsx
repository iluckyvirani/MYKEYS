"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import {
  COOKIE_CONSENT_OPEN_EVENT,
  getCookieConsent,
  saveCookieConsent,
  type CookiePreferences,
} from "@/lib/cookieConsent";

type View = "main" | "settings";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [view, setView] = useState<View>("main");
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = getCookieConsent();
    if (!existing) {
      setVisible(true);
    } else {
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
    }

    const onOpen = () => {
      const current = getCookieConsent();
      if (current) {
        setAnalytics(current.analytics);
        setMarketing(current.marketing);
      }
      setView("settings");
      setVisible(true);
    };

    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  const persist = (prefs: Pick<CookiePreferences, "analytics" | "marketing">) => {
    saveCookieConsent(prefs);
    setVisible(false);
    setView("main");
  };

  const acceptAll = () => persist({ analytics: true, marketing: true });
  const rejectAll = () => persist({ analytics: false, marketing: false });
  const saveSettings = () => persist({ analytics, marketing });

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
    >
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />

      <div className="relative w-full max-w-[520px] max-h-[min(90vh,640px)] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-start gap-3 px-6 pt-6 pb-2 shrink-0">
          <Cookie className="w-7 h-7 text-green-600 mt-0.5 shrink-0" strokeWidth={1.75} />
          <div className="flex-1 min-w-0">
            <h2
              id="cookie-consent-title"
              className="text-2xl sm:text-[28px] font-bold text-slate-900 leading-tight"
            >
              Choose your cookies
            </h2>
          </div>
          {view === "settings" && (
            <button
              type="button"
              onClick={() => setView("main")}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-3 text-[15px] text-gray-700 leading-relaxed">
          {view === "main" ? (
            <>
              <p>
                We and our partners store or access personal data, like unique
                identifiers, on your device to process personal data for purposes
                such as personalised advertising and content, advertising and
                content measurement, and audience research.
              </p>
              <p className="mt-4">
                You can accept all cookies, reject non-essential cookies, or manage
                your preferences. Choosing{" "}
                <strong className="text-slate-900">Accept all</strong> enables
                analytics and marketing cookies. Choosing{" "}
                <strong className="text-slate-900">Reject all</strong> keeps only
                necessary cookies that make the site work.
              </p>
              <p className="mt-4">
                <Link
                  href="/cookies"
                  className="text-green-600 font-semibold underline-offset-2 hover:underline"
                >
                  Learn more about how we use cookies
                </Link>
              </p>
              <p className="mt-5 font-bold text-slate-900">
                We and our partners process data to provide:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-600">
                <li>Store and/or access information on a device</li>
                <li>Personalised advertising and content</li>
                <li>Advertising and content measurement</li>
                <li>Audience research and services development</li>
              </ul>
            </>
          ) : (
            <div className="space-y-4 pb-2">
              <p className="text-gray-600">
                Necessary cookies are always on. Turn analytics and marketing on or
                off below, then save your choices.
              </p>

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">Necessary</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Required for login, security, and core site features.
                    </p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                    Always on
                  </span>
                </div>
              </div>

              <label className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-gray-300">
                <div>
                  <p className="font-semibold text-slate-900">Analytics</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Helps us understand how visitors use MYKEYS so we can improve it.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="mt-1 h-5 w-5 accent-green-600 cursor-pointer"
                />
              </label>

              <label className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-gray-300">
                <div>
                  <p className="font-semibold text-slate-900">Marketing</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Used to show more relevant ads and measure campaign performance.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="mt-1 h-5 w-5 accent-green-600 cursor-pointer"
                />
              </label>
            </div>
          )}
        </div>

        <div className="shrink-0 px-6 pt-2 pb-6 space-y-3 border-t border-gray-100 bg-white">
          {view === "main" ? (
            <>
              <button
                type="button"
                onClick={() => setView("settings")}
                className="w-full text-center text-green-600 font-semibold hover:underline py-1"
              >
                Manage settings
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="w-full h-12 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-base transition-colors"
              >
                Accept all
              </button>
              <button
                type="button"
                onClick={rejectAll}
                className="w-full h-12 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-base transition-colors"
              >
                Reject all
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={saveSettings}
                className="w-full h-12 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-base transition-colors"
              >
                Save settings
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="w-full h-12 rounded-lg border-2 border-[#3db2ad] text-green-600 hover:bg-teal-50 font-semibold text-base transition-colors"
              >
                Accept all
              </button>
              <button
                type="button"
                onClick={rejectAll}
                className="w-full text-center text-gray-600 font-medium hover:text-slate-900 py-1"
              >
                Reject all
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
