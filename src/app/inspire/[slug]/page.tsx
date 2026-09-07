import { notFound } from "next/navigation";

/** Catch-all for unknown /inspire/[slug] topics — dedicated pages own real routes. */
export default function InspireTopicFallback() {
  notFound();
}
