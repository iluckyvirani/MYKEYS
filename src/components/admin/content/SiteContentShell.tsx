"use client";

import Link from "next/link";
import { ReactNode, useMemo, useState } from "react";
import {
  ChevronDown,
  ExternalLink,
  FileText,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CONTENT_NAV_GROUPS,
  ContentNavKey,
  getContentNavItem,
} from "@/components/admin/content/siteContentNav";

export type SectionTab = {
  key: string;
  label: string;
  hint?: string;
};

type SiteContentShellProps = {
  activePage: ContentNavKey;
  title?: string;
  description?: string;
  sections?: SectionTab[];
  activeSection?: string;
  onSectionChange?: (key: string) => void;
  onSave?: () => void;
  saving?: boolean;
  saveLabel?: string;
  children: ReactNode;
};

export default function SiteContentShell({
  activePage,
  title,
  description,
  sections = [],
  activeSection,
  onSectionChange,
  onSave,
  saving = false,
  saveLabel = "Save changes",
  children,
}: SiteContentShellProps) {
  const current = getContentNavItem(activePage);
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = title || current.label;
  const pageDescription = description || current.description;

  const activeSectionMeta = useMemo(
    () => sections.find((s) => s.key === activeSection),
    [sections, activeSection]
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
            Site Content
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 truncate">
            {pageTitle}
          </h1>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl">
            {pageDescription}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href={current.liveHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            View live page
          </Link>
          {onSave ? (
            <Button
              onClick={onSave}
              disabled={saving}
              className="h-10 bg-green-600 hover:bg-green-700 text-white cursor-pointer"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saveLabel}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Mobile page picker */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left cursor-pointer"
        >
          <div>
            <p className="text-xs text-gray-500">Editing page</p>
            <p className="font-semibold text-gray-900">{current.label}</p>
          </div>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-gray-500 transition-transform",
              mobileOpen && "rotate-180"
            )}
          />
        </button>
        {mobileOpen ? (
          <div className="mt-2 rounded-xl border border-gray-200 bg-white p-2 max-h-72 overflow-y-auto shadow-sm">
            {CONTENT_NAV_GROUPS.map((group) => (
              <div key={group.id} className="mb-2 last:mb-0">
                <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm cursor-pointer",
                      item.key === activePage
                        ? "bg-green-50 text-green-800 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-5 items-start">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block sticky top-4 self-start">
          <nav className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm max-h-[calc(100vh-7rem)] overflow-y-auto">
            {CONTENT_NAV_GROUPS.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.id} className="mb-4 last:mb-0">
                  <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    <Icon className="w-3.5 h-3.5" />
                    {group.label}
                  </div>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = item.key === activePage;
                      return (
                        <li key={item.key}>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
                              active
                                ? "bg-green-600 text-white font-semibold shadow-sm"
                                : "text-gray-700 hover:bg-gray-50"
                            )}
                          >
                            <FileText
                              className={cn(
                                "w-3.5 h-3.5 shrink-0",
                                active ? "text-white/90" : "text-gray-400"
                              )}
                            />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Editor column */}
        <div className="space-y-4 min-w-0">
          {sections.length > 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm overflow-x-auto">
              <div className="flex gap-1 min-w-max">
                {sections.map((section) => {
                  const active = section.key === activeSection;
                  return (
                    <button
                      key={section.key}
                      type="button"
                      onClick={() => onSectionChange?.(section.key)}
                      className={cn(
                        "px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap",
                        active
                          ? "bg-[#0f3d36] text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {section.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {activeSectionMeta?.hint ? (
            <div className="rounded-xl border border-teal-100 bg-teal-50/70 px-4 py-3 text-sm text-teal-900">
              {activeSectionMeta.hint}
            </div>
          ) : null}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
            {children}
          </div>

          {/* Bottom sticky save for long forms */}
          {onSave ? (
            <div className="sticky bottom-3 z-10">
              <div className="rounded-xl border border-gray-200 bg-white/95 backdrop-blur px-4 py-3 shadow-lg flex items-center justify-between gap-3">
                <p className="text-sm text-gray-600 truncate">
                  {activeSectionMeta
                    ? `Editing: ${activeSectionMeta.label}`
                    : `Editing: ${pageTitle}`}
                </p>
                <Button
                  onClick={onSave}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white cursor-pointer shrink-0"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saveLabel}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
