import ContinentsBestResidencesClient from "./ContinentsBestResidencesClent";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  type: "page",
  data: {
    title: "Rankings of the Best Branded Residences by Continent | BBR",
    description:
      "Explore the rankings of the Best Branded Residences by continent, featuring luxury homes and top-rated properties in prime locations worldwide.",
    slug: "best-residences/continents",
    keywords: [
      "best residences",
      "luxury residences",
      "branded residences",
      "continents",
    ],
  },
});

export default function ContinentsPage() {
  return <ContinentsBestResidencesClient />;
}
