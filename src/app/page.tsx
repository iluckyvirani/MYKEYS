import { getHomeContent } from "@/lib/content/homeContent";
import HomePageClient from "./HomePageClient";

export default async function Home() {
  const content = await getHomeContent();
  return <HomePageClient initialContent={content} />;
}
