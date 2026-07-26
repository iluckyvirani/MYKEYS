export type MovingStory = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cta: string;
  image: string;
  imageAlt: string;
};

export type MovingStoriesSectionContent = {
  items: MovingStory[];
  featured: MovingStory;
};

export const MOVING_STORIES: MovingStory[] = [
  {
    id: "1",
    slug: "dream-home-after-styling-interiors",
    title:
      "‘After styling interiors for a decade, I finally got to create my dream home’",
    excerpt: "",
    cta: "Read more",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Woman in a brightly decorated dining room",
  },
  {
    id: "2",
    slug: "electric-home-energy-usage",
    title:
      "‘Our summer energy usage has dropped to £1 in our electric home’",
    excerpt: "",
    cta: "Take a look...",
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Home with solar panels on the roof",
  },
  {
    id: "3",
    slug: "favourite-postcode",
    title: "Staying in my favourite postcode was my right move",
    excerpt: "",
    cta: "Read more",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Couple inside their home",
  },
  {
    id: "4",
    slug: "london-to-countryside",
    title:
      "We swapped renting in London for a countryside home with energy-saving features",
    excerpt: "",
    cta: "Read more",
    image:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Family relaxing on a sofa",
  },
  {
    id: "5",
    slug: "hometown-fixer-upper",
    title: "I moved back to my hometown to transform a fixer-upper",
    excerpt: "Read more...",
    cta: "Read more",
    image:
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Woman on a pink sofa",
  },
  {
    id: "6",
    slug: "built-for-renters",
    title: "Discovering a Built for Renters home was our right move",
    excerpt: "Read Andrew & Marco's story...",
    cta: "Read more",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Two people in a bright kitchen",
  },
  {
    id: "7",
    slug: "london-neighbourhood-community",
    title:
      "We stumbled upon a London neighbourhood with community at its heart",
    excerpt: "Read Phin's story...",
    cta: "Read more",
    image:
      "https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=800&q=80",
    imageAlt: "People in a plant-filled room",
  },
  {
    id: "8",
    slug: "period-home-renovation",
    title: "Renovating a period home was our right move",
    excerpt: "Read Alex's story...",
    cta: "Read more",
    image:
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Period home interior",
  },
  {
    id: "9",
    slug: "buying-together",
    title: "Selling our homes and buying together was our right move",
    excerpt: "Read Jack's story...",
    cta: "Read more",
    image:
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Couple in their new home",
  },
];

/** Portrait card shown in the sidebar */
export const SIDEBAR_FEATURED_STORY: MovingStory = {
  id: "sidebar-1",
  slug: "wreck-by-the-sea",
  title: "We bought a wreck by the sea & made it home",
  excerpt: "",
  cta: "Read their moving story",
  image:
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=900&q=80",
  imageAlt: "Smiling couple outdoors",
};

export const DEFAULT_MOVING_STORIES_LIST: MovingStoriesSectionContent = {
  items: MOVING_STORIES,
  featured: SIDEBAR_FEATURED_STORY,
};

export const LIST_PAGE_SIZE = 4;

export function slugifyStoryTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/['']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || `story-${Date.now()}`
  );
}

export function mergeMovingStoriesList(
  stored?: Partial<MovingStoriesSectionContent> | null
): MovingStoriesSectionContent {
  const items =
    Array.isArray(stored?.items) && stored.items.length > 0
      ? stored.items.map((item, i) => ({
          ...MOVING_STORIES[Math.min(i, MOVING_STORIES.length - 1)],
          ...item,
          id: item.id || `story-${i + 1}`,
          slug: item.slug || slugifyStoryTitle(item.title || `story-${i + 1}`),
        }))
      : DEFAULT_MOVING_STORIES_LIST.items;

  const featured = {
    ...DEFAULT_MOVING_STORIES_LIST.featured,
    ...(stored?.featured || {}),
  };

  return { items, featured };
}

export function getAllMovingStories(
  list: MovingStoriesSectionContent = DEFAULT_MOVING_STORIES_LIST
): MovingStory[] {
  return [...list.items, list.featured];
}
