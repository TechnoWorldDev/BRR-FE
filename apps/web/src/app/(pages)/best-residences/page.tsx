import BestResidencesClient from "./BestResidencesClient";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  type: "page",
  data: {
    title: "Rankings – Best Branded Residences",
    description:
      "Explore the best branded residences worldwide. Expert rankings, reviews, and top picks by region and lifestyle.",
    slug: "best-residences",
    keywords: ["best residences", "rankings", "branded residences"],
  },
});

export default function BestResidencesPage() {
  return <BestResidencesClient />;
}
