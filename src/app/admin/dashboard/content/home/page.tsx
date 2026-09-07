"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  DEFAULT_HOME_CONTENT,
  HOME_SECTIONS,
  HomeContent,
  HomeSectionKey,
} from "@/lib/content/homeDefaults";
import SiteContentShell from "@/components/admin/content/SiteContentShell";
import {
  ContentField,
  ContentTextArea,
} from "@/components/admin/content/ContentFields";
import { Loader2 } from "lucide-react";

const SECTION_META: Record<
  HomeSectionKey,
  { label: string; hint: string }
> = {
  hero: {
    label: "Hero",
    hint: "This is the first thing visitors see at the top of the homepage.",
  },
  categories: {
    label: "Property Categories",
    hint: "Cards that link people into Buy, Rent, and Short Stay.",
  },
  featured: {
    label: "Featured Properties",
    hint: "Section heading above the featured listings grid.",
  },
  testimonials: {
    label: "Testimonials",
    hint: "Customer quotes and the bottom stats bar.",
  },
  stats: {
    label: "Trusted / Stats",
    hint: "Trust section numbers and supporting copy.",
  },
  faq: {
    label: "FAQ titles",
    hint: "Only the FAQ section title/subtitle — questions are managed under FAQs.",
  },
};

export default function AdminHomeContentPage() {
  const { toast } = useToast();
  const [content, setContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT);
  const [active, setActive] = useState<HomeSectionKey>("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/content/home");
      if (res.data?.data?.content) {
        setContent({ ...DEFAULT_HOME_CONTENT, ...res.data.data.content });
      }
    } catch {
      toast({
        title: "Failed to load home content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const saveSection = async () => {
    setSaving(true);
    try {
      await api.put("/admin/content/home", {
        section: active,
        content: content[active],
      });
      toast({ title: `${SECTION_META[active].label} saved` });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <SiteContentShell
        activePage="home"
        sections={HOME_SECTIONS.map((key) => ({
          key,
          label: SECTION_META[key].label,
          hint: SECTION_META[key].hint,
        }))}
        activeSection={active}
        onSectionChange={(key) => setActive(key as HomeSectionKey)}
        onSave={saveSection}
        saving={saving}
        saveLabel={`Save ${SECTION_META[active].label}`}
      >
        {active === "hero" && (
            <div className="space-y-5 max-w-2xl">
              <ContentField
                label="Title (line 1)"
                value={content.hero.title}
                hint="Main headline on the first line"
                onChange={(v) =>
                  setContent((c) => ({ ...c, hero: { ...c.hero, title: v } }))
                }
              />
              <ContentField
                label="Title highlight (line 2)"
                value={content.hero.titleHighlight}
                hint="Shown in teal under the main title"
                onChange={(v) =>
                  setContent((c) => ({
                    ...c,
                    hero: { ...c.hero, titleHighlight: v },
                  }))
                }
              />
              <ContentTextArea
                label="Description"
                value={content.hero.subtitle}
                hint="Short supporting sentence under the headline"
                onChange={(v) =>
                  setContent((c) => ({
                    ...c,
                    hero: { ...c.hero, subtitle: v },
                  }))
                }
              />
            </div>
          )}

          {active === "featured" && (
            <div className="space-y-5 max-w-2xl">
              <ContentField
                label="Badge"
                value={content.featured.badge}
                onChange={(v) =>
                  setContent((c) => ({
                    ...c,
                    featured: { ...c.featured, badge: v },
                  }))
                }
              />
              <ContentField
                label="Heading"
                value={content.featured.title}
                onChange={(v) =>
                  setContent((c) => ({
                    ...c,
                    featured: { ...c.featured, title: v },
                  }))
                }
              />
              <ContentTextArea
                label="Description"
                value={content.featured.subtitle}
                onChange={(v) =>
                  setContent((c) => ({
                    ...c,
                    featured: { ...c.featured, subtitle: v },
                  }))
                }
              />
            </div>
          )}

          {active === "faq" && (
            <div className="space-y-5 max-w-2xl">
              <ContentField
                label="FAQ section title"
                value={content.faq.title}
                onChange={(v) =>
                  setContent((c) => ({ ...c, faq: { ...c.faq, title: v } }))
                }
              />
              <ContentTextArea
                label="FAQ section description"
                value={content.faq.subtitle}
                onChange={(v) =>
                  setContent((c) => ({ ...c, faq: { ...c.faq, subtitle: v } }))
                }
              />
              <p className="text-sm text-gray-500 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                Individual FAQ Q&amp;A items are managed under{" "}
                <Link
                  href="/admin/dashboard/faqs"
                  className="text-green-700 font-medium hover:underline"
                >
                  FAQs
                </Link>
                .
              </p>
            </div>
          )}

          {active === "categories" && (
            <div className="space-y-6">
              <div className="space-y-5 max-w-2xl">
                <ContentField
                  label="Badge"
                  value={content.categories.badge}
                  onChange={(v) =>
                    setContent((c) => ({
                      ...c,
                      categories: { ...c.categories, badge: v },
                    }))
                  }
                />
                <ContentField
                  label="Section heading"
                  value={content.categories.title}
                  onChange={(v) =>
                    setContent((c) => ({
                      ...c,
                      categories: { ...c.categories, title: v },
                    }))
                  }
                />
                <ContentTextArea
                  label="Section description"
                  value={content.categories.subtitle}
                  onChange={(v) =>
                    setContent((c) => ({
                      ...c,
                      categories: { ...c.categories, subtitle: v },
                    }))
                  }
                />
              </div>

              {content.categories.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-xl p-5 space-y-4 bg-gray-50/50"
                >
                  <h3 className="font-semibold text-gray-900">
                    Category {idx + 1}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      {item.title || item.id}
                    </span>
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <ContentField
                      label="Heading"
                      value={item.title}
                      onChange={(v) =>
                        setContent((c) => {
                          const items = [...c.categories.items];
                          items[idx] = { ...items[idx], title: v };
                          return {
                            ...c,
                            categories: { ...c.categories, items },
                          };
                        })
                      }
                    />
                    <ContentField
                      label="Link"
                      value={item.link}
                      hint="e.g. /buy or /rent/whole-property"
                      onChange={(v) =>
                        setContent((c) => {
                          const items = [...c.categories.items];
                          items[idx] = { ...items[idx], link: v };
                          return {
                            ...c,
                            categories: { ...c.categories, items },
                          };
                        })
                      }
                    />
                  </div>
                  <ContentTextArea
                    label="Description"
                    value={item.description}
                    onChange={(v) =>
                      setContent((c) => {
                        const items = [...c.categories.items];
                        items[idx] = { ...items[idx], description: v };
                        return {
                          ...c,
                          categories: { ...c.categories, items },
                        };
                      })
                    }
                  />
                  <ContentTextArea
                    label="List points (one per line)"
                    value={(item.features || []).join("\n")}
                    onChange={(v) =>
                      setContent((c) => {
                        const items = [...c.categories.items];
                        items[idx] = {
                          ...items[idx],
                          features: v
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        };
                        return {
                          ...c,
                          categories: { ...c.categories, items },
                        };
                      })
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {active === "testimonials" && (
            <div className="space-y-6">
              <div className="space-y-5 max-w-2xl">
                <ContentField
                  label="Heading"
                  value={content.testimonials.title}
                  onChange={(v) =>
                    setContent((c) => ({
                      ...c,
                      testimonials: { ...c.testimonials, title: v },
                    }))
                  }
                />
                <ContentTextArea
                  label="Description"
                  value={content.testimonials.subtitle}
                  onChange={(v) =>
                    setContent((c) => ({
                      ...c,
                      testimonials: { ...c.testimonials, subtitle: v },
                    }))
                  }
                />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Bottom bar numbers
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {content.testimonials.barStats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="flex gap-2 items-center border rounded-xl p-3 bg-gray-50/50"
                    >
                      <Input
                        value={stat.value}
                        onChange={(e) =>
                          setContent((c) => {
                            const barStats = [...c.testimonials.barStats];
                            barStats[idx] = {
                              ...barStats[idx],
                              value: e.target.value,
                            };
                            return {
                              ...c,
                              testimonials: { ...c.testimonials, barStats },
                            };
                          })
                        }
                        placeholder="10K+"
                        className="w-24 h-11"
                      />
                      <Input
                        value={stat.label}
                        onChange={(e) =>
                          setContent((c) => {
                            const barStats = [...c.testimonials.barStats];
                            barStats[idx] = {
                              ...barStats[idx],
                              label: e.target.value,
                            };
                            return {
                              ...c,
                              testimonials: { ...c.testimonials, barStats },
                            };
                          })
                        }
                        placeholder="Active Users"
                        className="h-11"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {content.testimonials.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-xl p-5 space-y-4 bg-gray-50/50"
                >
                  <h3 className="font-semibold text-gray-900">
                    Testimonial {idx + 1}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <ContentField
                      label="Name"
                      value={item.name}
                      onChange={(v) =>
                        setContent((c) => {
                          const items = [...c.testimonials.items];
                          items[idx] = { ...items[idx], name: v };
                          return {
                            ...c,
                            testimonials: { ...c.testimonials, items },
                          };
                        })
                      }
                    />
                    <ContentField
                      label="Role"
                      value={item.role}
                      onChange={(v) =>
                        setContent((c) => {
                          const items = [...c.testimonials.items];
                          items[idx] = { ...items[idx], role: v };
                          return {
                            ...c,
                            testimonials: { ...c.testimonials, items },
                          };
                        })
                      }
                    />
                    <ContentField
                      label="Emoji / avatar"
                      value={item.image}
                      onChange={(v) =>
                        setContent((c) => {
                          const items = [...c.testimonials.items];
                          items[idx] = { ...items[idx], image: v };
                          return {
                            ...c,
                            testimonials: { ...c.testimonials, items },
                          };
                        })
                      }
                    />
                    <ContentField
                      label="Tagline"
                      value={item.propertyType}
                      hint="e.g. Bought a 2BHK in London"
                      onChange={(v) =>
                        setContent((c) => {
                          const items = [...c.testimonials.items];
                          items[idx] = { ...items[idx], propertyType: v };
                          return {
                            ...c,
                            testimonials: { ...c.testimonials, items },
                          };
                        })
                      }
                    />
                  </div>
                  <ContentTextArea
                    label="Quote"
                    value={item.content}
                    onChange={(v) =>
                      setContent((c) => {
                        const items = [...c.testimonials.items];
                        items[idx] = { ...items[idx], content: v };
                        return {
                          ...c,
                          testimonials: { ...c.testimonials, items },
                        };
                      })
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {active === "stats" && (
            <div className="space-y-6">
              <div className="space-y-5 max-w-2xl">
                <ContentField
                  label="Badge"
                  value={content.stats.badge}
                  onChange={(v) =>
                    setContent((c) => ({
                      ...c,
                      stats: { ...c.stats, badge: v },
                    }))
                  }
                />
                <ContentField
                  label="Heading"
                  value={content.stats.title}
                  onChange={(v) =>
                    setContent((c) => ({
                      ...c,
                      stats: { ...c.stats, title: v },
                    }))
                  }
                />
                <ContentField
                  label="Heading highlight"
                  value={content.stats.titleHighlight}
                  onChange={(v) =>
                    setContent((c) => ({
                      ...c,
                      stats: { ...c.stats, titleHighlight: v },
                    }))
                  }
                />
                <ContentTextArea
                  label="Description"
                  value={content.stats.subtitle}
                  onChange={(v) =>
                    setContent((c) => ({
                      ...c,
                      stats: { ...c.stats, subtitle: v },
                    }))
                  }
                />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Main stat cards
                </h3>
                <div className="space-y-4">
                  {content.stats.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 border rounded-xl p-4 bg-gray-50/50"
                    >
                      <ContentField
                        label="Value"
                        value={item.value}
                        onChange={(v) =>
                          setContent((c) => {
                            const items = [...c.stats.items];
                            items[idx] = { ...items[idx], value: v };
                            return { ...c, stats: { ...c.stats, items } };
                          })
                        }
                      />
                      <ContentField
                        label="Label"
                        value={item.label}
                        onChange={(v) =>
                          setContent((c) => {
                            const items = [...c.stats.items];
                            items[idx] = { ...items[idx], label: v };
                            return { ...c, stats: { ...c.stats, items } };
                          })
                        }
                      />
                      <ContentField
                        label="Description"
                        value={item.description}
                        onChange={(v) =>
                          setContent((c) => {
                            const items = [...c.stats.items];
                            items[idx] = { ...items[idx], description: v };
                            return { ...c, stats: { ...c.stats, items } };
                          })
                        }
                      />
                      <ContentField
                        label="Icon key"
                        value={item.icon}
                        hint="Internal icon name"
                        onChange={(v) =>
                          setContent((c) => {
                            const items = [...c.stats.items];
                            items[idx] = { ...items[idx], icon: v };
                            return { ...c, stats: { ...c.stats, items } };
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Additional stats row
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {content.stats.additionalStats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="flex gap-2 items-center border rounded-xl p-3 bg-gray-50/50"
                    >
                      <Input
                        value={stat.value}
                        onChange={(e) =>
                          setContent((c) => {
                            const additionalStats = [
                              ...c.stats.additionalStats,
                            ];
                            additionalStats[idx] = {
                              ...additionalStats[idx],
                              value: e.target.value,
                            };
                            return {
                              ...c,
                              stats: { ...c.stats, additionalStats },
                            };
                          })
                        }
                        className="w-24 h-11"
                      />
                      <Input
                        value={stat.label}
                        onChange={(e) =>
                          setContent((c) => {
                            const additionalStats = [
                              ...c.stats.additionalStats,
                            ];
                            additionalStats[idx] = {
                              ...additionalStats[idx],
                              label: e.target.value,
                            };
                            return {
                              ...c,
                              stats: { ...c.stats, additionalStats },
                            };
                          })
                        }
                        className="h-11"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
      </SiteContentShell>
    </AdminDashboardLayout>
  );
}
