import { getPageContent } from "@/lib/content/pageContent";
import {
  getDefaultInspireItems,
  mergeInspireItems,
  type InspireItemsContent,
  type InspireItemsPageKey,
} from "@/lib/content/inspireItems";

export async function getInspireItemsServer<T extends InspireItemsContent>(
  page: InspireItemsPageKey
): Promise<T> {
  try {
    const content = await getPageContent(page);
    return mergeInspireItems(page, content.items as Parameters<typeof mergeInspireItems>[1]) as T;
  } catch {
    return getDefaultInspireItems(page) as T;
  }
}
