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
  const res = await fetch(
    `${baseUrl}/api/${apiVersion}/ranking-categories/slug/${params.slug}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  const category = data.data;

  const cityName = category?.name;

  // Use spreadsheet template for dynamic SEO
  return generatePageMetadata({
    type: "page",
    data: {
      title: `Rankings of the Best Branded Residences in ${cityName} by BBR`,
      description: ` Explore the rankings of ${cityName}'s Best Branded Residences and luxury homes, featuring top properties designed for premium living experiences.`,
      // description: `Discover the best branded residences in ${cityName}. Explore top urban luxury homes, expert reviews, and exclusive property listings.`,
      slug: `best-residences/cities/${params.slug}`,
      keywords: ["city", "branded residences", cityName],
    },
  });
}

export default function CategoryPage() {
  return <SingleBestResidencesClient />;
}
