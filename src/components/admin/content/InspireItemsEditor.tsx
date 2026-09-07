"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ContentField,
  ContentTextArea,
} from "@/components/admin/content/ContentFields";
import { ImageUploadField } from "@/components/admin/content/ImageUploadField";
import type { InspirePageContent } from "@/lib/content/inspireDefaults";
import {
  emptyCountryGuide,
  emptyOverseasItem,
  emptyPropertyNewsItem,
  mergeInspireItems,
  type CountryGuidesItemsContent,
  type EnergyItemsContent,
  type HousingTrendsItemsContent,
  type InspireItemsPageKey,
  type MortgageItemsContent,
  type OverseasBlogItemsContent,
  type PropertyGuidesItemsContent,
  type PropertyNewsItemsContent,
} from "@/lib/content/inspireItems";
import { slugifyStoryTitle } from "@/lib/movingStories";

export function InspireItemsEditor({
  page,
  content,
  setContent,
}: {
  page: InspireItemsPageKey;
  content: InspirePageContent;
  setContent: React.Dispatch<React.SetStateAction<InspirePageContent>>;
}) {
  const items = mergeInspireItems(page, content.items);

  const setItems = (next: typeof items) => {
    setContent((c) => ({ ...c, items: next }));
  };

  if (page === "property-news") {
    const data = items as PropertyNewsItemsContent;
    return (
      <div className="space-y-6 max-w-3xl">
        <p className="text-sm text-gray-500">
          Upload images and edit property news cards. Save the Items section when
          done.
        </p>
        {data.items.map((article, index) => (
          <div
            key={article.id}
            className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50"
          >
            <div className="flex justify-between items-start gap-3">
              <h4 className="font-semibold text-gray-900">
                Article {index + 1}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={data.items.length <= 1}
                className="text-red-600 cursor-pointer"
                onClick={() =>
                  setItems({
                    ...data,
                    items: data.items.filter((_, i) => i !== index),
                  })
                }
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <ContentField
              label="Title"
              value={article.title}
              onChange={(v) =>
                setItems({
                  ...data,
                  items: data.items.map((a, i) =>
                    i === index
                      ? {
                          ...a,
                          title: v,
                          slug: a.slug || slugifyStoryTitle(v),
                        }
                      : a
                  ),
                })
              }
            />
            <ContentField
              label="Slug"
              value={article.slug}
              onChange={(v) =>
                setItems({
                  ...data,
                  items: data.items.map((a, i) =>
                    i === index ? { ...a, slug: slugifyStoryTitle(v) } : a
                  ),
                })
              }
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <ContentField
                label="Category"
                value={article.category}
                onChange={(v) =>
                  setItems({
                    ...data,
                    items: data.items.map((a, i) =>
                      i === index ? { ...a, category: v } : a
                    ),
                  })
                }
              />
              <ContentField
                label="Date"
                value={article.date}
                onChange={(v) =>
                  setItems({
                    ...data,
                    items: data.items.map((a, i) =>
                      i === index ? { ...a, date: v } : a
                    ),
                  })
                }
              />
            </div>
            <ContentTextArea
              label="Summary (optional)"
              value={article.summary || ""}
              rows={2}
              onChange={(v) =>
                setItems({
                  ...data,
                  items: data.items.map((a, i) =>
                    i === index ? { ...a, summary: v } : a
                  ),
                })
              }
            />
            <ImageUploadField
              image={article.image}
              folder="mykeys/inspire/property-news"
              onUploaded={(url) =>
                setItems({
                  ...data,
                  items: data.items.map((a, i) =>
                    i === index ? { ...a, image: url } : a
                  ),
                })
              }
            />
            <ContentField
              label="Image alt"
              value={article.imageAlt}
              onChange={(v) =>
                setItems({
                  ...data,
                  items: data.items.map((a, i) =>
                    i === index ? { ...a, imageAlt: v } : a
                  ),
                })
              }
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-dashed border-2 border-green-300 text-green-800 cursor-pointer"
          onClick={() =>
            setItems({
              ...data,
              items: [
                ...data.items,
                emptyPropertyNewsItem(data.items.length + 1),
              ],
            })
          }
        >
          <Plus className="w-4 h-4 mr-2" />
          Add article
        </Button>

        <div className="pt-4 border-t border-gray-200 space-y-3">
          <h3 className="font-semibold text-gray-900">Sidebar featured story</h3>
          <ContentField
            label="Title"
            value={data.featured.title}
            onChange={(v) =>
              setItems({ ...data, featured: { ...data.featured, title: v } })
            }
          />
          <ContentField
            label="CTA"
            value={data.featured.cta}
            onChange={(v) =>
              setItems({ ...data, featured: { ...data.featured, cta: v } })
            }
          />
          <ContentField
            label="Slug (moving story link)"
            value={data.featured.slug}
            onChange={(v) =>
              setItems({
                ...data,
                featured: { ...data.featured, slug: slugifyStoryTitle(v) },
              })
            }
          />
          <ImageUploadField
            image={data.featured.image}
            folder="mykeys/inspire/property-news"
            onUploaded={(url) =>
              setItems({ ...data, featured: { ...data.featured, image: url } })
            }
          />
        </div>
      </div>
    );
  }

  if (page === "overseas-blog") {
    const data = items as OverseasBlogItemsContent;
    return (
      <div className="space-y-6 max-w-3xl">
        <ImageUploadField
          label="Page hero image"
          image={data.heroImage}
          folder="mykeys/inspire/overseas-blog"
          onUploaded={(url) => setItems({ ...data, heroImage: url })}
        />
        {data.items.map((article, index) => (
          <div
            key={article.id}
            className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50"
          >
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-gray-900">
                Article {index + 1}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={data.items.length <= 1}
                className="text-red-600 cursor-pointer"
                onClick={() =>
                  setItems({
                    ...data,
                    items: data.items.filter((_, i) => i !== index),
                  })
                }
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <ContentField
              label="Title"
              value={article.title}
              onChange={(v) =>
                setItems({
                  ...data,
                  items: data.items.map((a, i) =>
                    i === index ? { ...a, title: v } : a
                  ),
                })
              }
            />
            <ContentField
              label="Slug"
              value={article.slug}
              onChange={(v) =>
                setItems({
                  ...data,
                  items: data.items.map((a, i) =>
                    i === index ? { ...a, slug: slugifyStoryTitle(v) } : a
                  ),
                })
              }
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <ContentField
                label="Country"
                value={article.country}
                onChange={(v) =>
                  setItems({
                    ...data,
                    items: data.items.map((a, i) =>
                      i === index ? { ...a, country: v } : a
                    ),
                  })
                }
              />
              <ContentField
                label="Date"
                value={article.date}
                onChange={(v) =>
                  setItems({
                    ...data,
                    items: data.items.map((a, i) =>
                      i === index ? { ...a, date: v } : a
                    ),
                  })
                }
              />
            </div>
            <ContentTextArea
              label="Excerpt"
              value={article.excerpt}
              rows={2}
              onChange={(v) =>
                setItems({
                  ...data,
                  items: data.items.map((a, i) =>
                    i === index ? { ...a, excerpt: v } : a
                  ),
                })
              }
            />
            <ImageUploadField
              image={article.image}
              folder="mykeys/inspire/overseas-blog"
              onUploaded={(url) =>
                setItems({
                  ...data,
                  items: data.items.map((a, i) =>
                    i === index ? { ...a, image: url } : a
                  ),
                })
              }
            />
            <ContentField
              label="Image alt"
              value={article.imageAlt}
              onChange={(v) =>
                setItems({
                  ...data,
                  items: data.items.map((a, i) =>
                    i === index ? { ...a, imageAlt: v } : a
                  ),
                })
              }
            />
            <ContentTextArea
              label="Body (one paragraph per line)"
              value={(article.body || []).join("\n\n")}
              rows={6}
              onChange={(v) =>
                setItems({
                  ...data,
                  items: data.items.map((a, i) =>
                    i === index
                      ? {
                          ...a,
                          body: v
                            .split(/\n\s*\n/)
                            .map((p) => p.trim())
                            .filter(Boolean),
                        }
                      : a
                  ),
                })
              }
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-dashed border-2 border-green-300 text-green-800 cursor-pointer"
          onClick={() =>
            setItems({
              ...data,
              items: [...data.items, emptyOverseasItem(data.items.length + 1)],
            })
          }
        >
          <Plus className="w-4 h-4 mr-2" />
          Add article
        </Button>
      </div>
    );
  }

  if (page === "country-guides") {
    const data = items as CountryGuidesItemsContent;
    return (
      <div className="space-y-6 max-w-3xl">
        {data.items.map((guide, index) => (
          <div
            key={guide.id}
            className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50"
          >
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-gray-900">
                {guide.name || `Guide ${index + 1}`}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={data.items.length <= 1}
                className="text-red-600 cursor-pointer"
                onClick={() =>
                  setItems({
                    ...data,
                    items: data.items.filter((_, i) => i !== index),
                  })
                }
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <ContentField
                label="Country name"
                value={guide.name}
                onChange={(v) =>
                  setItems({
                    ...data,
                    items: data.items.map((g, i) =>
                      i === index ? { ...g, name: v } : g
                    ),
                  })
                }
              />
              <ContentField
                label="Flag code (e.g. es)"
                value={guide.flagCode}
                onChange={(v) =>
                  setItems({
                    ...data,
                    items: data.items.map((g, i) =>
                      i === index ? { ...g, flagCode: v } : g
                    ),
                  })
                }
              />
            </div>
            <ContentField
              label="Title"
              value={guide.title}
              onChange={(v) =>
                setItems({
                  ...data,
                  items: data.items.map((g, i) =>
                    i === index ? { ...g, title: v } : g
                  ),
                })
              }
            />
            <ContentField
              label="Slug"
              value={guide.slug}
              onChange={(v) =>
                setItems({
                  ...data,
                  items: data.items.map((g, i) =>
                    i === index ? { ...g, slug: slugifyStoryTitle(v) } : g
                  ),
                })
              }
            />
            <ContentTextArea
              label="Intro"
              value={guide.intro}
              rows={3}
              onChange={(v) =>
                setItems({
                  ...data,
                  items: data.items.map((g, i) =>
                    i === index ? { ...g, intro: v } : g
                  ),
                })
              }
            />
            <ImageUploadField
              image={guide.image}
              folder="mykeys/inspire/country-guides"
              onUploaded={(url) =>
                setItems({
                  ...data,
                  items: data.items.map((g, i) =>
                    i === index ? { ...g, image: url } : g
                  ),
                })
              }
            />
            <ContentField
              label="Image alt"
              value={guide.imageAlt}
              onChange={(v) =>
                setItems({
                  ...data,
                  items: data.items.map((g, i) =>
                    i === index ? { ...g, imageAlt: v } : g
                  ),
                })
              }
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-dashed border-2 border-green-300 text-green-800 cursor-pointer"
          onClick={() =>
            setItems({
              ...data,
              items: [...data.items, emptyCountryGuide(data.items.length + 1)],
            })
          }
        >
          <Plus className="w-4 h-4 mr-2" />
          Add country guide
        </Button>
      </div>
    );
  }

  if (page === "energy-efficiency") {
    const data = items as EnergyItemsContent;
    return (
      <div className="space-y-8 max-w-3xl">
        <p className="text-sm text-gray-500">
          Edit guide titles and upload images for energy guides.
        </p>
        {data.sections.map((section, si) => (
          <div key={section.id} className="space-y-4">
            <div className="space-y-2">
              <ContentField
                label="Section title"
                value={section.title}
                onChange={(v) =>
                  setItems({
                    sections: data.sections.map((s, i) =>
                      i === si ? { ...s, title: v } : s
                    ),
                  })
                }
              />
              <ContentTextArea
                label="Section description"
                value={section.description}
                rows={2}
                onChange={(v) =>
                  setItems({
                    sections: data.sections.map((s, i) =>
                      i === si ? { ...s, description: v } : s
                    ),
                  })
                }
              />
            </div>
            {section.guides.map((guide, gi) => (
              <div
                key={guide.id}
                className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50"
              >
                <h4 className="font-medium text-gray-800 text-sm">
                  Guide {gi + 1}
                </h4>
                <ContentField
                  label="Title"
                  value={guide.title}
                  onChange={(v) =>
                    setItems({
                      sections: data.sections.map((s, i) =>
                        i === si
                          ? {
                              ...s,
                              guides: s.guides.map((g, j) =>
                                j === gi ? { ...g, title: v } : g
                              ),
                            }
                          : s
                      ),
                    })
                  }
                />
                <ContentField
                  label="Slug"
                  value={guide.slug}
                  onChange={(v) =>
                    setItems({
                      sections: data.sections.map((s, i) =>
                        i === si
                          ? {
                              ...s,
                              guides: s.guides.map((g, j) =>
                                j === gi
                                  ? { ...g, slug: slugifyStoryTitle(v) }
                                  : g
                              ),
                            }
                          : s
                      ),
                    })
                  }
                />
                <ImageUploadField
                  image={guide.image || ""}
                  folder="mykeys/inspire/energy"
                  onUploaded={(url) =>
                    setItems({
                      sections: data.sections.map((s, i) =>
                        i === si
                          ? {
                              ...s,
                              guides: s.guides.map((g, j) =>
                                j === gi ? { ...g, image: url } : g
                              ),
                            }
                          : s
                      ),
                    })
                  }
                />
                <ContentField
                  label="Image alt"
                  value={guide.imageAlt || ""}
                  onChange={(v) =>
                    setItems({
                      sections: data.sections.map((s, i) =>
                        i === si
                          ? {
                              ...s,
                              guides: s.guides.map((g, j) =>
                                j === gi ? { ...g, imageAlt: v } : g
                              ),
                            }
                          : s
                      ),
                    })
                  }
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // mortgage-guides
  if (page === "property-guides") {
    const data = items as PropertyGuidesItemsContent;
    return (
      <div className="space-y-6 max-w-3xl">
        <ImageUploadField
          label="Hero image"
          image={data.heroImage}
          folder="mykeys/inspire/property-guides"
          onUploaded={(url) => setItems({ ...data, heroImage: url })}
        />
        <p className="text-sm text-gray-500">
          Edit guide categories and link destinations. Every link should point to
          a real page.
        </p>
        {data.categories.map((cat, ci) => (
          <div
            key={cat.id}
            className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50"
          >
            <ContentField
              label="Category title"
              value={cat.title}
              onChange={(v) =>
                setItems({
                  ...data,
                  categories: data.categories.map((c, i) =>
                    i === ci ? { ...c, title: v } : c
                  ),
                })
              }
            />
            {cat.links.map((link, li) => (
              <div
                key={`${cat.id}-${li}`}
                className="grid sm:grid-cols-2 gap-2 pl-2 border-l-2 border-green-200"
              >
                <ContentField
                  label="Link label"
                  value={link.label}
                  onChange={(v) =>
                    setItems({
                      ...data,
                      categories: data.categories.map((c, i) =>
                        i === ci
                          ? {
                              ...c,
                              links: c.links.map((l, j) =>
                                j === li ? { ...l, label: v } : l
                              ),
                            }
                          : c
                      ),
                    })
                  }
                />
                <ContentField
                  label="Link URL"
                  value={link.href}
                  onChange={(v) =>
                    setItems({
                      ...data,
                      categories: data.categories.map((c, i) =>
                        i === ci
                          ? {
                              ...c,
                              links: c.links.map((l, j) =>
                                j === li ? { ...l, href: v } : l
                              ),
                            }
                          : c
                      ),
                    })
                  }
                />
              </div>
            ))}
          </div>
        ))}
        <h3 className="font-semibold text-gray-900 pt-2">Sidebar accordions</h3>
        {data.sidebar.map((acc, ai) => (
          <div
            key={acc.id}
            className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50"
          >
            <ContentField
              label="Accordion title"
              value={acc.title}
              onChange={(v) =>
                setItems({
                  ...data,
                  sidebar: data.sidebar.map((a, i) =>
                    i === ai ? { ...a, title: v } : a
                  ),
                })
              }
            />
            {acc.links.map((link, li) => (
              <div
                key={`${acc.id}-${li}`}
                className="grid sm:grid-cols-2 gap-2"
              >
                <ContentField
                  label="Link label"
                  value={link.label}
                  onChange={(v) =>
                    setItems({
                      ...data,
                      sidebar: data.sidebar.map((a, i) =>
                        i === ai
                          ? {
                              ...a,
                              links: a.links.map((l, j) =>
                                j === li ? { ...l, label: v } : l
                              ),
                            }
                          : a
                      ),
                    })
                  }
                />
                <ContentField
                  label="Link URL"
                  value={link.href}
                  onChange={(v) =>
                    setItems({
                      ...data,
                      sidebar: data.sidebar.map((a, i) =>
                        i === ai
                          ? {
                              ...a,
                              links: a.links.map((l, j) =>
                                j === li ? { ...l, href: v } : l
                              ),
                            }
                          : a
                      ),
                    })
                  }
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (page === "housing-trends") {
    const data = items as HousingTrendsItemsContent;
    return (
      <div className="space-y-6 max-w-3xl">
        <ImageUploadField
          label="Hero image"
          image={data.heroImage}
          folder="mykeys/inspire/housing-trends"
          onUploaded={(url) => setItems({ ...data, heroImage: url })}
        />
        <ContentField
          label="Published date"
          value={data.publishedDate}
          onChange={(v) => setItems({ ...data, publishedDate: v })}
        />
        <ContentField
          label="Download button label"
          value={data.downloadLabel}
          onChange={(v) => setItems({ ...data, downloadLabel: v })}
        />
        <ContentField
          label="Download / report URL"
          value={data.downloadUrl}
          hint="Used by the Download full report button"
          onChange={(v) => setItems({ ...data, downloadUrl: v })}
        />
        <ContentField
          label="Summary headline"
          value={data.summaryHeadline}
          onChange={(v) => setItems({ ...data, summaryHeadline: v })}
        />
        <ContentTextArea
          label="Summary bullets (one per line)"
          value={data.summaryBullets.join("\n")}
          rows={5}
          onChange={(v) =>
            setItems({
              ...data,
              summaryBullets: v
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean),
            })
          }
        />
        <h3 className="font-semibold text-gray-900">Past reports</h3>
        {data.pastReports.map((report, ri) => (
          <div key={ri} className="grid sm:grid-cols-2 gap-2">
            <ContentField
              label="Report label"
              value={report.label}
              onChange={(v) =>
                setItems({
                  ...data,
                  pastReports: data.pastReports.map((r, i) =>
                    i === ri ? { ...r, label: v } : r
                  ),
                })
              }
            />
            <ContentField
              label="Report URL"
              value={report.href}
              onChange={(v) =>
                setItems({
                  ...data,
                  pastReports: data.pastReports.map((r, i) =>
                    i === ri ? { ...r, href: v } : r
                  ),
                })
              }
            />
          </div>
        ))}
      </div>
    );
  }

  // mortgage-guides
  const data = items as MortgageItemsContent;
  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Spotlight cards</h3>
        {data.spotlight.map((card, index) => (
          <div
            key={card.slug}
            className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50"
          >
            <ContentField
              label="Title"
              value={card.title}
              onChange={(v) =>
                setItems({
                  ...data,
                  spotlight: data.spotlight.map((c, i) =>
                    i === index ? { ...c, title: v } : c
                  ),
                })
              }
            />
            <ContentField
              label="Category"
              value={card.category}
              onChange={(v) =>
                setItems({
                  ...data,
                  spotlight: data.spotlight.map((c, i) =>
                    i === index ? { ...c, category: v } : c
                  ),
                })
              }
            />
            <ImageUploadField
              image={card.image}
              folder="mykeys/inspire/mortgage"
              onUploaded={(url) =>
                setItems({
                  ...data,
                  spotlight: data.spotlight.map((c, i) =>
                    i === index ? { ...c, image: url } : c
                  ),
                })
              }
            />
          </div>
        ))}
      </div>

      {data.sections.map((section, si) => (
        <div key={section.id} className="space-y-4">
          <ContentField
            label="Section title"
            value={section.title}
            onChange={(v) =>
              setItems({
                ...data,
                sections: data.sections.map((s, i) =>
                  i === si ? { ...s, title: v } : s
                ),
              })
            }
          />
          {section.guides.map((guide, gi) => (
            <div
              key={guide.id}
              className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50"
            >
              <ContentField
                label="Guide title"
                value={guide.title}
                onChange={(v) =>
                  setItems({
                    ...data,
                    sections: data.sections.map((s, i) =>
                      i === si
                        ? {
                            ...s,
                            guides: s.guides.map((g, j) =>
                              j === gi ? { ...g, title: v } : g
                            ),
                          }
                        : s
                    ),
                  })
                }
              />
              <ImageUploadField
                image={guide.image || ""}
                folder="mykeys/inspire/mortgage"
                onUploaded={(url) =>
                  setItems({
                    ...data,
                    sections: data.sections.map((s, i) =>
                      i === si
                        ? {
                            ...s,
                            guides: s.guides.map((g, j) =>
                              j === gi ? { ...g, image: url } : g
                            ),
                          }
                        : s
                    ),
                  })
                }
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
