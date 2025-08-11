import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import SingleBestResidencesClient from "../../[slug]/SingleBestResidencesClient";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v1";
    const res = await fetch(`${baseUrl}/api/${apiVersion}/ranking-categories/slug/${params.slug}`, { cache: "no-store" });
    const data = await res.json();
    const countryName = data?.data?.name;

  // Use spreadsheet template for dynamic SEO
  return generatePageMetadata({
    type: "page",
    data: {
      title: `Best Branded Residences in ${countryName} – Rankings & Listings`,
      description: `Explore the best branded residences in ${countryName}. View expert rankings, reviews, and top luxury property listings.`,
      slug: `best-residences/countries/${params.slug}`,
      keywords: ["country", "branded residences", countryName],
    },
  });
}

export default function CategoryPage() {
  return <SingleBestResidencesClient />;
}
