/** Client-side sort for buy/rent result cards */

export type ResultsSortKey = "highest" | "lowest" | "newest" | "oldest";

export const RESULTS_SORT_OPTIONS: { value: ResultsSortKey; label: string }[] = [
  { value: "highest", label: "Highest Price" },
  { value: "lowest", label: "Lowest Price" },
  { value: "newest", label: "Newest Listed" },
  { value: "oldest", label: "Oldest Listed" },
];

type SortableListing = {
  propertyPrice: string;
  createdAt?: string | null;
};

function priceValue(priceLabel: string): number {
  return parseFloat(String(priceLabel).replace(/[^0-9.]/g, "")) || 0;
}

function listedAt(item: SortableListing): number {
  if (!item.createdAt) return 0;
  const t = new Date(item.createdAt).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export function sortResultListings<T extends SortableListing>(
  items: T[],
  sortBy: string
): T[] {
  const list = [...items];
  switch (sortBy) {
    case "lowest":
      return list.sort(
        (a, b) => priceValue(a.propertyPrice) - priceValue(b.propertyPrice)
      );
    case "newest":
      return list.sort((a, b) => listedAt(b) - listedAt(a));
    case "oldest":
      return list.sort((a, b) => listedAt(a) - listedAt(b));
    case "highest":
    default:
      return list.sort(
        (a, b) => priceValue(b.propertyPrice) - priceValue(a.propertyPrice)
      );
  }
}
