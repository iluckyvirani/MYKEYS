import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_HOME_CONTENT,
  HOME_SECTIONS,
  HomeContent,
  HomeSectionKey,
} from "@/lib/content/homeDefaults";

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Shallow-merge objects; arrays in DB replace defaults entirely when present. */
function mergeSection<T extends Record<string, unknown>>(
  defaults: T,
  stored: unknown
): T {
  if (!isObject(stored)) return defaults;
  const out = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const d = defaults[key];
    const s = stored[key as string];
    if (s === undefined || s === null) continue;
    if (Array.isArray(d)) {
      if (Array.isArray(s)) out[key] = s as T[keyof T];
    } else if (isObject(d) && isObject(s)) {
      out[key] = { ...d, ...s } as T[keyof T];
    } else if (typeof s === typeof d) {
      out[key] = s as T[keyof T];
    }
  }
  return out;
}

export async function ensureHomeContentSeeded() {
  try {
    for (const section of HOME_SECTIONS) {
      const existing = await prisma.pageSection.findUnique({
        where: { page_section: { page: "home", section } },
      });
      if (!existing) {
        await prisma.pageSection.create({
          data: {
            page: "home",
            section,
            content: DEFAULT_HOME_CONTENT[section] as Prisma.InputJsonValue,
            isActive: true,
          },
        });
      }
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (
      msg.includes("Can't reach database") ||
      msg.includes("ENOTFOUND") ||
      msg.includes("ECONNREFUSED")
    ) {
      console.warn(
        "[home] Database unreachable — using default home content. Check DATABASE_URL / internet / DNS."
      );
      return;
    }
    throw error;
  }
}

export async function getHomeContent(): Promise<HomeContent> {
  try {
    await ensureHomeContentSeeded();
    const rows = await prisma.pageSection.findMany({
      where: { page: "home", isActive: true },
    });
    const bySection = Object.fromEntries(
      rows.map((r) => [r.section, r.content])
    ) as Partial<Record<HomeSectionKey, unknown>>;

    return {
      hero: mergeSection(
        DEFAULT_HOME_CONTENT.hero as unknown as Record<string, unknown>,
        bySection.hero
      ) as unknown as HomeContent["hero"],
      categories: mergeSection(
        DEFAULT_HOME_CONTENT.categories as unknown as Record<string, unknown>,
        bySection.categories
      ) as unknown as HomeContent["categories"],
      featured: mergeSection(
        DEFAULT_HOME_CONTENT.featured as unknown as Record<string, unknown>,
        bySection.featured
      ) as unknown as HomeContent["featured"],
      testimonials: mergeSection(
        DEFAULT_HOME_CONTENT.testimonials as unknown as Record<string, unknown>,
        bySection.testimonials
      ) as unknown as HomeContent["testimonials"],
      stats: mergeSection(
        DEFAULT_HOME_CONTENT.stats as unknown as Record<string, unknown>,
        bySection.stats
      ) as unknown as HomeContent["stats"],
      faq: mergeSection(
        DEFAULT_HOME_CONTENT.faq as unknown as Record<string, unknown>,
        bySection.faq
      ) as unknown as HomeContent["faq"],
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (
      msg.includes("Can't reach database") ||
      msg.includes("ENOTFOUND") ||
      msg.includes("ECONNREFUSED")
    ) {
      console.warn("[home] Database unreachable — serving default home content.");
      return DEFAULT_HOME_CONTENT;
    }
    console.error("getHomeContent error:", error);
    return DEFAULT_HOME_CONTENT;
  }
}

export async function upsertHomeSection(
  section: HomeSectionKey,
  content: unknown
) {
  return prisma.pageSection.upsert({
    where: { page_section: { page: "home", section } },
    create: {
      page: "home",
      section,
      content: content as Prisma.InputJsonValue,
      isActive: true,
    },
    update: {
      content: content as Prisma.InputJsonValue,
      isActive: true,
    },
  });
}
