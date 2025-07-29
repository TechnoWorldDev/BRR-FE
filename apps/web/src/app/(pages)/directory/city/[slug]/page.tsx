import CityResidencesClient from "./CityResidencesClient";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  // Fetch city data as before...
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v1";
  const url = `${baseUrl}/api/${apiVersion}/public/cities?limit=1000`;
  const response = await fetch(url);
  const data = await response.json();
  const city = data.data.find(
    (c: { name: string }) =>
      c.name.toLowerCase().replace(/\s+/g, "-") === params.slug.toLowerCase()
  );
  const cityName = city?.name || params.slug;

  // Use spreadsheet template for dynamic SEO
  return generatePageMetadata({
    type: "page",
    data: {
      title: `Branded Residences Directory – ${cityName}  | Luxury | BBR`,
      description: `Explore luxury branded residences in ${cityName}. Browse high-end property listings designed for elegance, culture, and premium urban living.`
      // description: `Discover branded residences in ${cityName}. Explore elegant homes, premier locations, and exclusive urban living opportunities.`,
      slug: `residences/city/${params.slug}`,
      keywords: ["city", "branded residences", cityName],
    },
  });
}

export default function Page(props: Record<string, unknown>) {
  return <CityResidencesClient {...props} />;
}
