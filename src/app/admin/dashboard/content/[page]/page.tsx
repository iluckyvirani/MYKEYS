"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_CONTACT_CONTENT,
  DEFAULT_COOKIES_CONTENT,
  DEFAULT_PRIVACY_CONTENT,
  DEFAULT_TERMS_CONTENT,
  getDefaultListingContent,
  isListingPage,
  LegalPageContent,
  LegalSection,
  ListingPageContent,
  ListingPageKey,
  SitePageKey,
  SITE_PAGES,
} from "@/lib/content/siteDefaults";
import {
  AboutPageContent,
  AboutSectionKey,
  mergeAboutContent,
} from "@/lib/content/aboutDefaults";
import {
  AboutContentEditor,
  getAboutSectionTabs,
} from "@/components/admin/content/AboutContentEditor";
import {
  getDefaultInspireContent,
  getInspireSections,
  InspirePageContent,
  INSPIRE_PAGE_LABELS,
  isInspirePage,
} from "@/lib/content/inspireDefaults";
import { mergeMovingStoriesList } from "@/lib/movingStories";
import {
  hasInspireItems,
  mergeInspireItems,
  type InspireItemsPageKey,
} from "@/lib/content/inspireItems";
import { MovingStoriesEditor } from "@/components/admin/content/MovingStoriesEditor";
import { InspireItemsEditor } from "@/components/admin/content/InspireItemsEditor";
import SiteContentShell, {
  type SectionTab,
} from "@/components/admin/content/SiteContentShell";
import {
  ContentField,
  ContentTextArea,
} from "@/components/admin/content/ContentFields";
import { Loader2, Plus, Trash2 } from "lucide-react";

const PAGE_LABELS: Record<SitePageKey, string> = {
  about: "About Us",
  contact: "Contact Us",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  cookies: "Cookie Policy",
  buy: "Buy",
  rent: "Whole Property",
  "room-to-rent": "Room to Rent",
  "short-stay": "Short Stay",
  ...INSPIRE_PAGE_LABELS,
};

type ListingSectionKey = "hero" | "howItWorks" | "faq";

const LISTING_SECTION_META: Record<
  ListingSectionKey,
  { label: string; hint: string }
> = {
  hero: {
    label: "Hero / Search",
    hint: "Search headline and input labels shown at the top of the page.",
  },
  howItWorks: {
    label: "How it works",
    hint: "Section titles, CTA banner, and stats under the steps.",
  },
  faq: {
    label: "FAQ titles",
    hint: "FAQ section chrome only — Q&A items live under Admin → FAQs.",
  },
};

function isSitePage(page: string): page is SitePageKey {
  return (SITE_PAGES as readonly string[]).includes(page);
}

export default function AdminSitePageContentPage() {
  const params = useParams();
  const router = useRouter();
  const pageParam = String(params.page || "");
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [about, setAbout] = useState<AboutPageContent>(DEFAULT_ABOUT_CONTENT);
  const [aboutSection, setAboutSection] = useState<AboutSectionKey>("hero");
  const [contactHero, setContactHero] = useState(DEFAULT_CONTACT_CONTENT.hero);
  const [legal, setLegal] = useState<LegalPageContent>(DEFAULT_PRIVACY_CONTENT);
  const [listing, setListing] = useState<ListingPageContent>(
    getDefaultListingContent("buy")
  );
  const [listingSection, setListingSection] =
    useState<ListingSectionKey>("hero");
  const [inspire, setInspire] = useState<InspirePageContent>(
    getDefaultInspireContent("moving-stories")
  );
  const [inspireSection, setInspireSection] = useState<
    "hero" | "sidebar" | "stories" | "items"
  >("hero");

  const page = isSitePage(pageParam) ? pageParam : null;

  const fetchContent = useCallback(async () => {
    if (!page) return;
    setLoading(true);
    try {
      const res = await api.get(`/admin/content/${page}`);
      const content = res.data?.data?.content || {};
      if (page === "about") {
        setAbout(mergeAboutContent(content));
        setAboutSection("hero");
      } else if (page === "contact") {
        setContactHero({
          ...DEFAULT_CONTACT_CONTENT.hero,
          ...(content.hero || {}),
        });
      } else if (isListingPage(page)) {
        const defaults = getDefaultListingContent(page);
        setListing({
          hero: { ...defaults.hero, ...(content.hero || {}) },
          howItWorks: {
            ...defaults.howItWorks,
            ...(content.howItWorks || {}),
            stats:
              Array.isArray(content.howItWorks?.stats) &&
              content.howItWorks.stats.length > 0
                ? content.howItWorks.stats
                : defaults.howItWorks.stats,
            benefits:
              Array.isArray(content.howItWorks?.benefits) &&
              content.howItWorks.benefits.length > 0
                ? content.howItWorks.benefits
                : defaults.howItWorks.benefits,
          },
          faq: { ...defaults.faq, ...(content.faq || {}) },
        });
        setListingSection("hero");
      } else if (isInspirePage(page)) {
        const defaults = getDefaultInspireContent(page);
        setInspire({
          hero: { ...defaults.hero, ...(content.hero || {}) },
          ...(defaults.sidebar || content.sidebar
            ? {
                sidebar: {
                  ...(defaults.sidebar || {
                    title: "",
                    body: "",
                    buttonLabel: "",
                  }),
                  ...(content.sidebar || {}),
                },
              }
            : {}),
          ...(page === "moving-stories"
            ? { stories: mergeMovingStoriesList(content.stories) }
            : {}),
          ...(hasInspireItems(page)
            ? { items: mergeInspireItems(page, content.items) }
            : {}),
        });
        setInspireSection("hero");
      } else if (content.main) {
        const defaults =
          page === "terms"
            ? DEFAULT_TERMS_CONTENT
            : page === "cookies"
              ? DEFAULT_COOKIES_CONTENT
              : DEFAULT_PRIVACY_CONTENT;
        setLegal({
          ...defaults,
          ...content.main,
          sections: Array.isArray(content.main.sections)
            ? content.main.sections
            : defaults.sections,
        });
      }
    } catch {
      toast({ title: "Failed to load content", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    if (!page) {
      router.replace("/admin/dashboard/content/about");
      return;
    }
    fetchContent();
  }, [page, fetchContent, router]);

  const save = async () => {
    if (!page) return;
    setSaving(true);
    try {
      if (page === "about") {
        await api.put(`/admin/content/${page}`, {
          section: aboutSection,
          content: about[aboutSection],
        });
      } else if (page === "contact") {
        await api.put(`/admin/content/${page}`, {
          section: "hero",
          content: contactHero,
        });
      } else if (isListingPage(page)) {
        await api.put(`/admin/content/${page}`, {
          section: listingSection,
          content: listing[listingSection],
        });
      } else if (isInspirePage(page)) {
        const payload =
          inspireSection === "sidebar"
            ? inspire.sidebar || { title: "", body: "", buttonLabel: "" }
            : inspireSection === "stories"
              ? mergeMovingStoriesList(inspire.stories)
              : inspireSection === "items" && hasInspireItems(page)
                ? mergeInspireItems(page, inspire.items)
                : inspire.hero;
        await api.put(`/admin/content/${page}`, {
          section: inspireSection,
          content: payload,
        });
      } else {
        await api.put(`/admin/content/${page}`, {
          section: "main",
          content: legal,
        });
      }
      toast({ title: `${PAGE_LABELS[page]} saved` });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (index: number, patch: Partial<LegalSection>) => {
    setLegal((prev) => ({
      ...prev,
      sections: prev.sections.map((s, i) =>
        i === index ? { ...s, ...patch } : s
      ),
    }));
  };

  const addSection = () => {
    setLegal((prev) => {
      const nextNum = prev.sections.length + 1;
      return {
        ...prev,
        sections: [
          ...prev.sections,
          {
            heading: `Section ${nextNum}`,
            body: "",
          },
        ],
      };
    });
    // Scroll to the new block after render
    requestAnimationFrame(() => {
      window.setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
      }, 50);
    });
  };

  const removeSection = (index: number) => {
    setLegal((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  if (!page || loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </AdminDashboardLayout>
    );
  }

  const saveLabel =
    page === "about"
      ? `Save ${getAboutSectionTabs().find((s) => s.key === aboutSection)?.label || "section"}`
      : isListingPage(page)
        ? `Save ${LISTING_SECTION_META[listingSection].label}`
        : isInspirePage(page)
          ? `Save ${
              inspireSection === "sidebar"
                ? "Sidebar"
                : inspireSection === "stories"
                  ? "Stories"
                  : inspireSection === "items"
                    ? "Items"
                    : "Hero"
            }`
          : "Save changes";

  const sections: SectionTab[] =
    page === "about"
      ? getAboutSectionTabs()
      : isListingPage(page)
        ? (Object.keys(LISTING_SECTION_META) as ListingSectionKey[]).map(
            (key) => ({
              key,
              label: LISTING_SECTION_META[key].label,
              hint: LISTING_SECTION_META[key].hint,
            })
          )
        : isInspirePage(page)
          ? getInspireSections(page).map((key) => ({
              key,
              label:
                key === "sidebar"
                  ? "Sidebar CTA"
                  : key === "stories"
                    ? "Stories"
                    : key === "items"
                      ? "Items"
                      : "Hero",
              hint:
                key === "sidebar"
                  ? "CTA box in the page sidebar."
                  : key === "stories" || key === "items"
                    ? "Cards and guides — upload images and edit titles."
                    : "Main page title and supporting copy.",
            }))
          : [];

  const activeSection =
    page === "about"
      ? aboutSection
      : isListingPage(page)
        ? listingSection
        : isInspirePage(page)
          ? inspireSection
          : undefined;

  const onSectionChange = (key: string) => {
    if (page === "about") setAboutSection(key as AboutSectionKey);
    if (isListingPage(page)) setListingSection(key as ListingSectionKey);
    if (isInspirePage(page))
      setInspireSection(key as "hero" | "sidebar" | "stories" | "items");
  };

  return (
    <AdminDashboardLayout>
      <SiteContentShell
        activePage={page}
        title={PAGE_LABELS[page]}
        sections={sections}
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        onSave={save}
        saving={saving}
        saveLabel={saveLabel}
      >
        {page === "about" && (
          <AboutContentEditor
            section={aboutSection}
            content={about}
            setContent={setAbout}
          />
        )}

        {page === "contact" && (
          <div className="space-y-5 max-w-2xl">
            <ContentField
              label="Title (line 1)"
              value={contactHero.title}
              onChange={(v) => setContactHero((h) => ({ ...h, title: v }))}
            />
            <ContentField
              label="Title highlight (line 2)"
              value={contactHero.titleHighlight}
              onChange={(v) =>
                setContactHero((h) => ({ ...h, titleHighlight: v }))
              }
            />
            <ContentTextArea
              label="Subtitle"
              value={contactHero.subtitle}
              onChange={(v) =>
                setContactHero((h) => ({ ...h, subtitle: v }))
              }
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <ContentField
                label="Support phone"
                value={contactHero.supportPhone}
                hint="Also shown in the site footer"
                onChange={(v) =>
                  setContactHero((h) => ({ ...h, supportPhone: v }))
                }
              />
              <ContentField
                label="Support email"
                value={contactHero.supportEmail}
                hint="Also shown in the site footer"
                onChange={(v) =>
                  setContactHero((h) => ({ ...h, supportEmail: v }))
                }
              />
            </div>
            <ContentTextArea
              label="Office address"
              value={contactHero.officeAddress || ""}
              hint="Shown in the site footer Get in Touch column"
              onChange={(v) =>
                setContactHero((h) => ({ ...h, officeAddress: v }))
              }
            />
            <ContentField
              label="Emergency phone"
              value={contactHero.emergencyPhone}
              onChange={(v) =>
                setContactHero((h) => ({ ...h, emergencyPhone: v }))
              }
            />
            <ContentField
              label="Emergency note"
              value={contactHero.emergencyNote}
              onChange={(v) =>
                setContactHero((h) => ({ ...h, emergencyNote: v }))
              }
            />
          </div>
        )}

        {isListingPage(page) && (
          <ListingEditor
            page={page}
            section={listingSection}
            listing={listing}
            setListing={setListing}
          />
        )}

        {isInspirePage(page) && inspireSection === "stories" && (
          <MovingStoriesEditor content={inspire} setContent={setInspire} />
        )}

        {isInspirePage(page) &&
          inspireSection === "items" &&
          hasInspireItems(page) && (
            <InspireItemsEditor
              page={page as InspireItemsPageKey}
              content={inspire}
              setContent={setInspire}
            />
          )}

        {isInspirePage(page) &&
          inspireSection !== "stories" &&
          inspireSection !== "items" && (
          <InspireEditor
            section={inspireSection === "sidebar" ? "sidebar" : "hero"}
            inspire={inspire}
            setInspire={setInspire}
          />
        )}

        {(page === "privacy" || page === "terms" || page === "cookies") && (
          <div className="space-y-6 max-w-3xl">
            <ContentField
              label="Page title"
              value={legal.title}
              onChange={(v) => setLegal((l) => ({ ...l, title: v }))}
            />
            <ContentField
              label="Last updated"
              value={legal.lastUpdated}
              hint="Shown under the page title"
              onChange={(v) => setLegal((l) => ({ ...l, lastUpdated: v }))}
            />
            <ContentTextArea
              label="Intro"
              value={legal.intro}
              onChange={(v) => setLegal((l) => ({ ...l, intro: v }))}
            />

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Policy sections</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Each block is one heading + body on the live page. Use{" "}
                  <span className="font-medium text-gray-700">
                    Add another section
                  </span>{" "}
                  below to create section {legal.sections.length + 1},{" "}
                  {legal.sections.length + 2}, and so on.
                </p>
              </div>
              {legal.sections.map((section, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <ContentField
                        label={`Section ${index + 1} heading`}
                        value={section.heading}
                        onChange={(v) => updateSection(index, { heading: v })}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSection(index)}
                      className="mt-7 text-red-600 hover:text-red-700 cursor-pointer"
                      aria-label={`Remove section ${index + 1}`}
                      disabled={legal.sections.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <ContentTextArea
                    label="Body"
                    value={section.body}
                    rows={5}
                    onChange={(v) => updateSection(index, { body: v })}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addSection}
                className="w-full h-12 border-dashed border-2 border-green-300 text-green-800 hover:bg-green-50 hover:border-green-400 cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add another section (Section {legal.sections.length + 1})
              </Button>
            </div>
          </div>
        )}
      </SiteContentShell>
    </AdminDashboardLayout>
  );
}

function ListingEditor({
  page,
  section,
  listing,
  setListing,
}: {
  page: ListingPageKey;
  section: ListingSectionKey;
  listing: ListingPageContent;
  setListing: React.Dispatch<React.SetStateAction<ListingPageContent>>;
}) {
  if (section === "hero") {
    return (
      <div className="space-y-5 max-w-2xl">
        <ContentField
          label="Search headline"
          value={listing.hero.title}
          onChange={(v) =>
            setListing((c) => ({ ...c, hero: { ...c.hero, title: v } }))
          }
        />
        <ContentField
          label="Search placeholder"
          value={listing.hero.placeholder}
          onChange={(v) =>
            setListing((c) => ({
              ...c,
              hero: { ...c.hero, placeholder: v },
            }))
          }
        />
        <ContentField
          label="Search button label"
          value={listing.hero.buttonLabel}
          onChange={(v) =>
            setListing((c) => ({
              ...c,
              hero: { ...c.hero, buttonLabel: v },
            }))
          }
        />
      </div>
    );
  }

  if (section === "howItWorks") {
    const stats = listing.howItWorks.stats || [];
    const benefits = listing.howItWorks.benefits || ["", "", "", ""];
    const isShortStay = page === "short-stay";

    return (
      <div className="space-y-6 max-w-2xl">
        <ContentField
          label="Section title"
          value={listing.howItWorks.title}
          onChange={(v) =>
            setListing((c) => ({
              ...c,
              howItWorks: { ...c.howItWorks, title: v },
            }))
          }
        />
        <ContentTextArea
          label="Section subtitle"
          value={listing.howItWorks.subtitle}
          onChange={(v) =>
            setListing((c) => ({
              ...c,
              howItWorks: { ...c.howItWorks, subtitle: v },
            }))
          }
        />

        <div className="border-t border-gray-200 pt-5 space-y-5">
          <h3 className="font-semibold text-gray-900">
            {isShortStay ? "Why book banner" : "CTA banner"}
          </h3>
          <ContentField
            label={isShortStay ? "Banner title" : "CTA title"}
            value={listing.howItWorks.ctaTitle || ""}
            hint={
              isShortStay
                ? 'e.g. "Why Book Short Rents with Hously?"'
                : 'e.g. "Ready to find your dream home?"'
            }
            onChange={(v) =>
              setListing((c) => ({
                ...c,
                howItWorks: { ...c.howItWorks, ctaTitle: v },
              }))
            }
          />
          {!isShortStay && (
            <>
              <ContentTextArea
                label="CTA description"
                value={listing.howItWorks.ctaSubtitle || ""}
                onChange={(v) =>
                  setListing((c) => ({
                    ...c,
                    howItWorks: { ...c.howItWorks, ctaSubtitle: v },
                  }))
                }
              />
              <ContentField
                label="CTA button label"
                value={listing.howItWorks.ctaButtonLabel || ""}
                onChange={(v) =>
                  setListing((c) => ({
                    ...c,
                    howItWorks: { ...c.howItWorks, ctaButtonLabel: v },
                  }))
                }
              />
            </>
          )}
        </div>

        {isShortStay && (
          <div className="border-t border-gray-200 pt-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Benefit bullets</h3>
            <p className="text-xs text-gray-500">
              Left-side checklist in the why-book box (up to 6 items).
            </p>
            {(benefits.length > 0 ? benefits : ["", "", "", ""])
              .slice(0, 6)
              .map((item, idx) => (
                <ContentField
                  key={idx}
                  label={`Benefit ${idx + 1}`}
                  value={item}
                  placeholder="Secure payment protection"
                  onChange={(v) =>
                    setListing((c) => {
                      const next = [
                        ...(c.howItWorks.benefits || ["", "", "", ""]),
                      ];
                      while (next.length <= idx) next.push("");
                      next[idx] = v;
                      return {
                        ...c,
                        howItWorks: {
                          ...c.howItWorks,
                          benefits: next,
                        },
                      };
                    })
                  }
                />
              ))}
            {(listing.howItWorks.benefits || []).length < 6 && (
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() =>
                  setListing((c) => ({
                    ...c,
                    howItWorks: {
                      ...c.howItWorks,
                      benefits: [...(c.howItWorks.benefits || []), ""],
                    },
                  }))
                }
              >
                Add benefit
              </Button>
            )}
          </div>
        )}

        <div className="border-t border-gray-200 pt-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Stats cards</h3>
          <p className="text-xs text-gray-500">
            {isShortStay
              ? "Four highlight numbers on the right of the why-book box."
              : "Four highlight numbers shown next to the CTA (Buy page)."}
          </p>
          {(stats.length > 0
            ? stats
            : [
                { value: "", label: "" },
                { value: "", label: "" },
                { value: "", label: "" },
                { value: "", label: "" },
              ]
          )
            .slice(0, 4)
            .map((stat, idx) => (
              <div
                key={idx}
                className="grid sm:grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-gray-50/50 p-3"
              >
                <ContentField
                  label={`Stat ${idx + 1} value`}
                  value={stat.value}
                  placeholder={isShortStay ? "£0" : "£15,000"}
                  onChange={(v) =>
                    setListing((c) => {
                      const next = [
                        ...(c.howItWorks.stats || [
                          { value: "", label: "" },
                          { value: "", label: "" },
                          { value: "", label: "" },
                          { value: "", label: "" },
                        ]),
                      ];
                      while (next.length < 4) next.push({ value: "", label: "" });
                      next[idx] = { ...next[idx], value: v };
                      return {
                        ...c,
                        howItWorks: { ...c.howItWorks, stats: next.slice(0, 4) },
                      };
                    })
                  }
                />
                <ContentField
                  label={`Stat ${idx + 1} label`}
                  value={stat.label}
                  placeholder={
                    isShortStay ? "Booking fees" : "Avg. saving vs agents"
                  }
                  onChange={(v) =>
                    setListing((c) => {
                      const next = [
                        ...(c.howItWorks.stats || [
                          { value: "", label: "" },
                          { value: "", label: "" },
                          { value: "", label: "" },
                          { value: "", label: "" },
                        ]),
                      ];
                      while (next.length < 4) next.push({ value: "", label: "" });
                      next[idx] = { ...next[idx], label: v };
                      return {
                        ...c,
                        howItWorks: { ...c.howItWorks, stats: next.slice(0, 4) },
                      };
                    })
                  }
                />
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <ContentField
        label="FAQ section title"
        value={listing.faq.title}
        onChange={(v) =>
          setListing((c) => ({ ...c, faq: { ...c.faq, title: v } }))
        }
      />
      <ContentTextArea
        label="FAQ section subtitle"
        value={listing.faq.subtitle}
        onChange={(v) =>
          setListing((c) => ({ ...c, faq: { ...c.faq, subtitle: v } }))
        }
      />
      <p className="text-sm text-gray-500 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
        FAQ questions/answers are managed under Admin → FAQs.
      </p>
    </div>
  );
}

function InspireEditor({
  section,
  inspire,
  setInspire,
}: {
  section: "hero" | "sidebar";
  inspire: InspirePageContent;
  setInspire: React.Dispatch<React.SetStateAction<InspirePageContent>>;
}) {
  if (section === "sidebar") {
    const sidebar = inspire.sidebar || {
      title: "",
      body: "",
      buttonLabel: "",
    };
    return (
      <div className="space-y-5 max-w-2xl">
        <ContentField
          label="Sidebar title"
          value={sidebar.title}
          onChange={(v) =>
            setInspire((c) => ({
              ...c,
              sidebar: { ...(c.sidebar || sidebar), title: v },
            }))
          }
        />
        <ContentTextArea
          label="Sidebar body"
          value={sidebar.body}
          onChange={(v) =>
            setInspire((c) => ({
              ...c,
              sidebar: { ...(c.sidebar || sidebar), body: v },
            }))
          }
        />
        <ContentField
          label="Button label"
          value={sidebar.buttonLabel}
          onChange={(v) =>
            setInspire((c) => ({
              ...c,
              sidebar: { ...(c.sidebar || sidebar), buttonLabel: v },
            }))
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <ContentField
        label="Title"
        value={inspire.hero.title}
        onChange={(v) =>
          setInspire((c) => ({ ...c, hero: { ...c.hero, title: v } }))
        }
      />
      <ContentField
        label="Title highlight (optional)"
        value={inspire.hero.titleHighlight || ""}
        hint="Used for accent colour words like Greener / Mortgage"
        onChange={(v) =>
          setInspire((c) => ({
            ...c,
            hero: { ...c.hero, titleHighlight: v },
          }))
        }
      />
      <ContentTextArea
        label="Subtitle"
        value={inspire.hero.subtitle}
        onChange={(v) =>
          setInspire((c) => ({ ...c, hero: { ...c.hero, subtitle: v } }))
        }
      />
      <ContentField
        label="Eyebrow (optional)"
        value={inspire.hero.eyebrow || ""}
        onChange={(v) =>
          setInspire((c) => ({ ...c, hero: { ...c.hero, eyebrow: v } }))
        }
      />
      <ContentField
        label="Section title (optional)"
        value={inspire.hero.sectionTitle || ""}
        onChange={(v) =>
          setInspire((c) => ({
            ...c,
            hero: { ...c.hero, sectionTitle: v },
          }))
        }
      />
      <ContentField
        label="CTA label (optional)"
        value={inspire.hero.ctaLabel || ""}
        onChange={(v) =>
          setInspire((c) => ({ ...c, hero: { ...c.hero, ctaLabel: v } }))
        }
      />
      <ContentField
        label="Search label (optional)"
        value={inspire.hero.searchLabel || ""}
        onChange={(v) =>
          setInspire((c) => ({
            ...c,
            hero: { ...c.hero, searchLabel: v },
          }))
        }
      />
      <ContentField
        label="Search placeholder (optional)"
        value={inspire.hero.searchPlaceholder || ""}
        onChange={(v) =>
          setInspire((c) => ({
            ...c,
            hero: { ...c.hero, searchPlaceholder: v },
          }))
        }
      />
      <ContentField
        label="Search button (optional)"
        value={inspire.hero.searchButton || ""}
        onChange={(v) =>
          setInspire((c) => ({
            ...c,
            hero: { ...c.hero, searchButton: v },
          }))
        }
      />
    </div>
  );
}
