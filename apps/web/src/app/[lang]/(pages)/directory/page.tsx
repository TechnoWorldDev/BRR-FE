import ResidencesClient from "./ResidencesClient";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  type: "page",
  data: {
    title: "Directory of Best Branded Residences | Luxury Branded Residences", // Example SEO title
    description:
      "Directory of luxury branded residences worldwide by BBR. Explore exclusive homes from top hotel, lifestyle, and automotive brands offering unparalleled...", // Example SEO description
    slug: "residences",
    keywords: ["residences", "luxury residences", "directory"],
  },
});

export default function ResidencesPage() {
  return <ResidencesClient />;
}
