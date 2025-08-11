import BestResidencesClient from "./BestResidencesClient";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import { getSEOData } from "@/lib/BBR_SEO_data"; 

const seoData = getSEOData("/rankings", null);
console.log("SEO Data for /rankings:", seoData); 

export const metadata: Metadata = generatePageMetadata({
  type: "page",
  data: {
    title: seoData?.["Suggested Meta Title"] ?? "Rankings – Best Branded Residences",
    description: seoData?.["Suggested Meta Description"] ?? "Explore the best branded residences worldwide. Expert rankings, reviews, and top picks by region and lifestyle.",
    slug: "best-residences",
    keywords: ["best residences", "rankings", "branded residences"],
  },
});

export default function BestResidencesPage() {
  return <BestResidencesClient />;
}
