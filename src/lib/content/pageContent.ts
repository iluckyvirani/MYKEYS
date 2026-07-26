import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getDefaultContentForPage,
  getSectionsForPage,
  SitePageKey,
  SITE_PAGES,
} from "@/lib/content/siteDefaults";

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

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

export function isSitePage(page: string): page is SitePageKey {
  return (SITE_PAGES as readonly string[]).includes(page);
}

export async function ensurePageContentSeeded(page: SitePageKey) {
  const defaults = getDefaultContentForPage(page) as Record<string, unknown>;
  for (const section of getSectionsForPage(page)) {
    const existing = await prisma.pageSection.findUnique({
      where: { page_section: { page, section } },
    });
    if (!existing) {
      await prisma.pageSection.create({
        data: {
          page,
          section,
          content: defaults[section] as Prisma.InputJsonValue,
          isActive: true,
        },
      });
    }
  }
}

export async function getPageContent(page: SitePageKey) {
  try {
    await ensurePageContentSeeded(page);
    const defaults = getDefaultContentForPage(page) as Record<string, unknown>;
    const rows = await prisma.pageSection.findMany({
      where: { page, isActive: true },
    });
    const bySection = Object.fromEntries(
      rows.map((r) => [r.section, r.content])
    );

    const result: Record<string, unknown> = {};
    for (const section of getSectionsForPage(page)) {
      const def = defaults[section];
      if (isObject(def)) {
        result[section] = mergeSection(
          def as Record<string, unknown>,
          bySection[section]
        );
      } else {
        result[section] = bySection[section] ?? def;
      }
    }
    return result;
  } catch (error) {
    console.error(`getPageContent(${page}) error:`, error);
    return getDefaultContentForPage(page) as Record<string, unknown>;
  }
}

export async function upsertPageSection(
  page: SitePageKey,
  section: string,
  content: unknown
) {
  const allowed = getSectionsForPage(page);
  if (!allowed.includes(section)) {
    throw new Error(`Invalid section "${section}" for page "${page}"`);
  }
  return prisma.pageSection.upsert({
    where: { page_section: { page, section } },
    create: {
      page,
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
