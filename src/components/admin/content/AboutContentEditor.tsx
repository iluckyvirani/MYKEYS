"use client";

import {
  ContentField,
  ContentTextArea,
} from "@/components/admin/content/ContentFields";
import {
  ABOUT_SECTIONS,
  AboutPageContent,
  AboutSectionKey,
} from "@/lib/content/aboutDefaults";

const SECTION_META: Record<AboutSectionKey, { label: string; hint: string }> = {
  hero: {
    label: "Hero",
    hint: "Top headline, CTAs, and the three feature cards.",
  },
  businessModel: {
    label: "Business Model",
    hint: "Features, revenue streams, and win-win stats.",
  },
  howItWorks: {
    label: "How It Works",
    hint: "Process steps, transaction types, and bottom CTA.",
  },
  stats: {
    label: "Stats & Growth",
    hint: "Counters, achievements, metrics, and timeline.",
  },
};

export function getAboutSectionTabs() {
  return ABOUT_SECTIONS.map((key) => ({
    key,
    label: SECTION_META[key].label,
    hint: SECTION_META[key].hint,
  }));
}

export function AboutContentEditor({
  section,
  content,
  setContent,
}: {
  section: AboutSectionKey;
  content: AboutPageContent;
  setContent: React.Dispatch<React.SetStateAction<AboutPageContent>>;
}) {
  if (section === "hero") {
    return (
      <div className="space-y-6 max-w-3xl">
        <ContentField
          label="Title (line 1)"
          value={content.hero.title}
          onChange={(v) =>
            setContent((c) => ({ ...c, hero: { ...c.hero, title: v } }))
          }
        />
        <ContentField
          label="Title highlight (line 2)"
          value={content.hero.titleHighlight}
          onChange={(v) =>
            setContent((c) => ({
              ...c,
              hero: { ...c.hero, titleHighlight: v },
            }))
          }
        />
        <ContentTextArea
          label="Subtitle"
          value={content.hero.subtitle}
          onChange={(v) =>
            setContent((c) => ({ ...c, hero: { ...c.hero, subtitle: v } }))
          }
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <ContentField
            label="Primary button"
            value={content.hero.primaryCta}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                hero: { ...c.hero, primaryCta: v },
              }))
            }
          />
          <ContentField
            label="Secondary button"
            value={content.hero.secondaryCta}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                hero: { ...c.hero, secondaryCta: v },
              }))
            }
          />
        </div>
        <div className="space-y-4 border-t pt-5">
          <h3 className="font-semibold text-gray-900">Feature cards</h3>
          {content.hero.cards.map((card, idx) => (
            <div
              key={idx}
              className="rounded-xl border bg-gray-50/50 p-4 space-y-3"
            >
              <p className="text-sm font-medium text-gray-700">Card {idx + 1}</p>
              <ContentField
                label="Title"
                value={card.title}
                onChange={(v) =>
                  setContent((c) => {
                    const cards = [...c.hero.cards];
                    cards[idx] = { ...cards[idx], title: v };
                    return { ...c, hero: { ...c.hero, cards } };
                  })
                }
              />
              <ContentTextArea
                label="Description"
                value={card.description}
                rows={2}
                onChange={(v) =>
                  setContent((c) => {
                    const cards = [...c.hero.cards];
                    cards[idx] = { ...cards[idx], description: v };
                    return { ...c, hero: { ...c.hero, cards } };
                  })
                }
              />
              <ContentField
                label="Link"
                value={card.href}
                onChange={(v) =>
                  setContent((c) => {
                    const cards = [...c.hero.cards];
                    cards[idx] = { ...cards[idx], href: v };
                    return { ...c, hero: { ...c.hero, cards } };
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section === "businessModel") {
    const bm = content.businessModel;
    return (
      <div className="space-y-6 max-w-3xl">
        <ContentField
          label="Badge"
          value={bm.badge}
          onChange={(v) =>
            setContent((c) => ({
              ...c,
              businessModel: { ...c.businessModel, badge: v },
            }))
          }
        />
        <ContentField
          label="Title"
          value={bm.title}
          onChange={(v) =>
            setContent((c) => ({
              ...c,
              businessModel: { ...c.businessModel, title: v },
            }))
          }
        />
        <ContentField
          label="Title highlight"
          value={bm.titleHighlight}
          onChange={(v) =>
            setContent((c) => ({
              ...c,
              businessModel: { ...c.businessModel, titleHighlight: v },
            }))
          }
        />
        <ContentTextArea
          label="Subtitle"
          value={bm.subtitle}
          onChange={(v) =>
            setContent((c) => ({
              ...c,
              businessModel: { ...c.businessModel, subtitle: v },
            }))
          }
        />

        <div className="space-y-4 border-t pt-5">
          <h3 className="font-semibold text-gray-900">Features</h3>
          {bm.features.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border bg-gray-50/50 p-4 space-y-3"
            >
              <p className="text-sm font-medium text-gray-700">
                Feature {idx + 1}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <ContentField
                  label="Title"
                  value={item.title}
                  onChange={(v) =>
                    setContent((c) => {
                      const features = [...c.businessModel.features];
                      features[idx] = { ...features[idx], title: v };
                      return {
                        ...c,
                        businessModel: { ...c.businessModel, features },
                      };
                    })
                  }
                />
                <ContentField
                  label="Model tag"
                  value={item.model}
                  hint="Short Term / Long Term / All Types"
                  onChange={(v) =>
                    setContent((c) => {
                      const features = [...c.businessModel.features];
                      features[idx] = { ...features[idx], model: v };
                      return {
                        ...c,
                        businessModel: { ...c.businessModel, features },
                      };
                    })
                  }
                />
              </div>
              <ContentTextArea
                label="Description"
                value={item.description}
                rows={2}
                onChange={(v) =>
                  setContent((c) => {
                    const features = [...c.businessModel.features];
                    features[idx] = { ...features[idx], description: v };
                    return {
                      ...c,
                      businessModel: { ...c.businessModel, features },
                    };
                  })
                }
              />
            </div>
          ))}
        </div>

        <div className="space-y-4 border-t pt-5">
          <ContentField
            label="Revenue section title"
            value={bm.revenueTitle}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                businessModel: { ...c.businessModel, revenueTitle: v },
              }))
            }
          />
          <ContentTextArea
            label="Revenue section subtitle"
            value={bm.revenueSubtitle}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                businessModel: { ...c.businessModel, revenueSubtitle: v },
              }))
            }
          />
          {bm.revenue.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border bg-gray-50/50 p-4 space-y-3"
            >
              <p className="text-sm font-medium text-gray-700">
                Revenue {idx + 1}
              </p>
              <ContentField
                label="Type"
                value={item.type}
                onChange={(v) =>
                  setContent((c) => {
                    const revenue = [...c.businessModel.revenue];
                    revenue[idx] = { ...revenue[idx], type: v };
                    return {
                      ...c,
                      businessModel: { ...c.businessModel, revenue },
                    };
                  })
                }
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <ContentField
                  label="Percentage / fee"
                  value={item.percentage}
                  onChange={(v) =>
                    setContent((c) => {
                      const revenue = [...c.businessModel.revenue];
                      revenue[idx] = { ...revenue[idx], percentage: v };
                      return {
                        ...c,
                        businessModel: { ...c.businessModel, revenue },
                      };
                    })
                  }
                />
                <ContentField
                  label="Description"
                  value={item.description}
                  onChange={(v) =>
                    setContent((c) => {
                      const revenue = [...c.businessModel.revenue];
                      revenue[idx] = { ...revenue[idx], description: v };
                      return {
                        ...c,
                        businessModel: { ...c.businessModel, revenue },
                      };
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 border-t pt-5">
          <ContentField
            label="Win-win title"
            value={bm.winTitle}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                businessModel: { ...c.businessModel, winTitle: v },
              }))
            }
          />
          <ContentTextArea
            label="Win-win subtitle"
            value={bm.winSubtitle}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                businessModel: { ...c.businessModel, winSubtitle: v },
              }))
            }
          />
          <div className="grid sm:grid-cols-3 gap-3">
            {bm.winStats.map((stat, idx) => (
              <div key={idx} className="rounded-xl border p-3 space-y-2">
                <ContentField
                  label="Value"
                  value={stat.value}
                  onChange={(v) =>
                    setContent((c) => {
                      const winStats = [...c.businessModel.winStats];
                      winStats[idx] = { ...winStats[idx], value: v };
                      return {
                        ...c,
                        businessModel: { ...c.businessModel, winStats },
                      };
                    })
                  }
                />
                <ContentField
                  label="Label"
                  value={stat.label}
                  onChange={(v) =>
                    setContent((c) => {
                      const winStats = [...c.businessModel.winStats];
                      winStats[idx] = { ...winStats[idx], label: v };
                      return {
                        ...c,
                        businessModel: { ...c.businessModel, winStats },
                      };
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (section === "howItWorks") {
    const hiw = content.howItWorks;
    return (
      <div className="space-y-6 max-w-3xl">
        <ContentField
          label="Badge"
          value={hiw.badge}
          onChange={(v) =>
            setContent((c) => ({
              ...c,
              howItWorks: { ...c.howItWorks, badge: v },
            }))
          }
        />
        <ContentField
          label="Title"
          value={hiw.title}
          onChange={(v) =>
            setContent((c) => ({
              ...c,
              howItWorks: { ...c.howItWorks, title: v },
            }))
          }
        />
        <ContentField
          label="Title highlight"
          value={hiw.titleHighlight}
          onChange={(v) =>
            setContent((c) => ({
              ...c,
              howItWorks: { ...c.howItWorks, titleHighlight: v },
            }))
          }
        />
        <ContentTextArea
          label="Subtitle"
          value={hiw.subtitle}
          onChange={(v) =>
            setContent((c) => ({
              ...c,
              howItWorks: { ...c.howItWorks, subtitle: v },
            }))
          }
        />

        <div className="space-y-4 border-t pt-5">
          <h3 className="font-semibold text-gray-900">Process steps</h3>
          {hiw.steps.map((step, idx) => (
            <div
              key={idx}
              className="rounded-xl border bg-gray-50/50 p-4 space-y-3"
            >
              <p className="text-sm font-medium text-gray-700">
                Step {idx + 1}
              </p>
              <ContentField
                label="Title"
                value={step.title}
                onChange={(v) =>
                  setContent((c) => {
                    const steps = [...c.howItWorks.steps];
                    steps[idx] = { ...steps[idx], title: v };
                    return { ...c, howItWorks: { ...c.howItWorks, steps } };
                  })
                }
              />
              <ContentTextArea
                label="Description"
                value={step.description}
                rows={2}
                onChange={(v) =>
                  setContent((c) => {
                    const steps = [...c.howItWorks.steps];
                    steps[idx] = { ...steps[idx], description: v };
                    return { ...c, howItWorks: { ...c.howItWorks, steps } };
                  })
                }
              />
              <ContentField
                label="Type tags (comma-separated)"
                value={step.types.join(", ")}
                hint="e.g. Short, Long, Buy"
                onChange={(v) =>
                  setContent((c) => {
                    const steps = [...c.howItWorks.steps];
                    steps[idx] = {
                      ...steps[idx],
                      types: v
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    };
                    return { ...c, howItWorks: { ...c.howItWorks, steps } };
                  })
                }
              />
            </div>
          ))}
        </div>

        <div className="space-y-4 border-t pt-5">
          <ContentField
            label="Choose section title"
            value={hiw.chooseTitle}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                howItWorks: { ...c.howItWorks, chooseTitle: v },
              }))
            }
          />
          <ContentTextArea
            label="Choose section subtitle"
            value={hiw.chooseSubtitle}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                howItWorks: { ...c.howItWorks, chooseSubtitle: v },
              }))
            }
          />
          {hiw.transactions.map((tx, idx) => (
            <div
              key={idx}
              className="rounded-xl border bg-gray-50/50 p-4 space-y-3"
            >
              <p className="text-sm font-medium text-gray-700">
                Transaction {idx + 1}
              </p>
              <ContentField
                label="Type"
                value={tx.type}
                onChange={(v) =>
                  setContent((c) => {
                    const transactions = [...c.howItWorks.transactions];
                    transactions[idx] = { ...transactions[idx], type: v };
                    return {
                      ...c,
                      howItWorks: { ...c.howItWorks, transactions },
                    };
                  })
                }
              />
              <ContentField
                label="Description"
                value={tx.description}
                onChange={(v) =>
                  setContent((c) => {
                    const transactions = [...c.howItWorks.transactions];
                    transactions[idx] = {
                      ...transactions[idx],
                      description: v,
                    };
                    return {
                      ...c,
                      howItWorks: { ...c.howItWorks, transactions },
                    };
                  })
                }
              />
              <ContentField
                label="Process steps"
                value={tx.steps}
                hint="Use → between steps"
                onChange={(v) =>
                  setContent((c) => {
                    const transactions = [...c.howItWorks.transactions];
                    transactions[idx] = { ...transactions[idx], steps: v };
                    return {
                      ...c,
                      howItWorks: { ...c.howItWorks, transactions },
                    };
                  })
                }
              />
              <ContentField
                label="Link"
                value={tx.href}
                onChange={(v) =>
                  setContent((c) => {
                    const transactions = [...c.howItWorks.transactions];
                    transactions[idx] = { ...transactions[idx], href: v };
                    return {
                      ...c,
                      howItWorks: { ...c.howItWorks, transactions },
                    };
                  })
                }
              />
            </div>
          ))}
        </div>

        <div className="space-y-4 border-t pt-5">
          <h3 className="font-semibold text-gray-900">Bottom CTA</h3>
          <ContentField
            label="CTA title"
            value={hiw.ctaTitle}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                howItWorks: { ...c.howItWorks, ctaTitle: v },
              }))
            }
          />
          <ContentTextArea
            label="CTA subtitle"
            value={hiw.ctaSubtitle}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                howItWorks: { ...c.howItWorks, ctaSubtitle: v },
              }))
            }
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <ContentField
              label="Primary button"
              value={hiw.ctaPrimary}
              onChange={(v) =>
                setContent((c) => ({
                  ...c,
                  howItWorks: { ...c.howItWorks, ctaPrimary: v },
                }))
              }
            />
            <ContentField
              label="Secondary button"
              value={hiw.ctaSecondary}
              onChange={(v) =>
                setContent((c) => ({
                  ...c,
                  howItWorks: { ...c.howItWorks, ctaSecondary: v },
                }))
              }
            />
          </div>
        </div>
      </div>
    );
  }

  // stats
  const st = content.stats;
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Main counters</h3>
        {st.items.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border bg-gray-50/50 p-4 grid sm:grid-cols-2 gap-3"
          >
            <ContentField
              label="Value (number)"
              value={String(item.value)}
              onChange={(v) =>
                setContent((c) => {
                  const items = [...c.stats.items];
                  items[idx] = {
                    ...items[idx],
                    value: Number(v.replace(/[^\d.]/g, "")) || 0,
                  };
                  return { ...c, stats: { ...c.stats, items } };
                })
              }
            />
            <ContentField
              label="Suffix"
              value={item.suffix}
              placeholder="+ / % / B"
              onChange={(v) =>
                setContent((c) => {
                  const items = [...c.stats.items];
                  items[idx] = { ...items[idx], suffix: v };
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
          </div>
        ))}
      </div>

      <div className="space-y-4 border-t pt-5">
        <ContentField
          label="Achievements title"
          value={st.achievementsTitle}
          onChange={(v) =>
            setContent((c) => ({
              ...c,
              stats: { ...c.stats, achievementsTitle: v },
            }))
          }
        />
        <ContentTextArea
          label="Achievements subtitle"
          value={st.achievementsSubtitle}
          onChange={(v) =>
            setContent((c) => ({
              ...c,
              stats: { ...c.stats, achievementsSubtitle: v },
            }))
          }
        />
        {st.achievements.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border bg-gray-50/50 p-4 space-y-3"
          >
            <div className="grid sm:grid-cols-3 gap-3">
              <ContentField
                label="Icon (emoji)"
                value={item.icon}
                onChange={(v) =>
                  setContent((c) => {
                    const achievements = [...c.stats.achievements];
                    achievements[idx] = { ...achievements[idx], icon: v };
                    return { ...c, stats: { ...c.stats, achievements } };
                  })
                }
              />
              <ContentField
                label="Value"
                value={item.value}
                onChange={(v) =>
                  setContent((c) => {
                    const achievements = [...c.stats.achievements];
                    achievements[idx] = { ...achievements[idx], value: v };
                    return { ...c, stats: { ...c.stats, achievements } };
                  })
                }
              />
              <ContentField
                label="Title"
                value={item.title}
                onChange={(v) =>
                  setContent((c) => {
                    const achievements = [...c.stats.achievements];
                    achievements[idx] = { ...achievements[idx], title: v };
                    return { ...c, stats: { ...c.stats, achievements } };
                  })
                }
              />
            </div>
            <ContentField
              label="Description"
              value={item.description}
              onChange={(v) =>
                setContent((c) => {
                  const achievements = [...c.stats.achievements];
                  achievements[idx] = {
                    ...achievements[idx],
                    description: v,
                  };
                  return { ...c, stats: { ...c.stats, achievements } };
                })
              }
            />
          </div>
        ))}
      </div>

      <div className="space-y-4 border-t pt-5">
        <h3 className="font-semibold text-gray-900">Extra metrics</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {st.metrics.map((m, idx) => (
            <div key={idx} className="rounded-xl border p-3 space-y-2">
              <ContentField
                label="Value"
                value={m.value}
                onChange={(v) =>
                  setContent((c) => {
                    const metrics = [...c.stats.metrics];
                    metrics[idx] = { ...metrics[idx], value: v };
                    return { ...c, stats: { ...c.stats, metrics } };
                  })
                }
              />
              <ContentField
                label="Label"
                value={m.label}
                onChange={(v) =>
                  setContent((c) => {
                    const metrics = [...c.stats.metrics];
                    metrics[idx] = { ...metrics[idx], label: v };
                    return { ...c, stats: { ...c.stats, metrics } };
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 border-t pt-5">
        <ContentField
          label="Growth title"
          value={st.growthTitle}
          onChange={(v) =>
            setContent((c) => ({
              ...c,
              stats: { ...c.stats, growthTitle: v },
            }))
          }
        />
        <ContentTextArea
          label="Growth subtitle"
          value={st.growthSubtitle}
          onChange={(v) =>
            setContent((c) => ({
              ...c,
              stats: { ...c.stats, growthSubtitle: v },
            }))
          }
        />
        {st.milestones.map((m, idx) => (
          <div
            key={idx}
            className="rounded-xl border bg-gray-50/50 p-4 grid sm:grid-cols-3 gap-3"
          >
            <ContentField
              label="Year"
              value={m.year}
              onChange={(v) =>
                setContent((c) => {
                  const milestones = [...c.stats.milestones];
                  milestones[idx] = { ...milestones[idx], year: v };
                  return { ...c, stats: { ...c.stats, milestones } };
                })
              }
            />
            <ContentField
              label="Event"
              value={m.event}
              onChange={(v) =>
                setContent((c) => {
                  const milestones = [...c.stats.milestones];
                  milestones[idx] = { ...milestones[idx], event: v };
                  return { ...c, stats: { ...c.stats, milestones } };
                })
              }
            />
            <ContentField
              label="Properties"
              value={m.properties}
              onChange={(v) =>
                setContent((c) => {
                  const milestones = [...c.stats.milestones];
                  milestones[idx] = { ...milestones[idx], properties: v };
                  return { ...c, stats: { ...c.stats, milestones } };
                })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
