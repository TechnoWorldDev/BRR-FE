import CountryResidencesClient from "./CountryResidencesClient";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  // Fetch country data as before...
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v1";
  const url = `${baseUrl}/api/${apiVersion}/public/countries?limit=1000`;
  const response = await fetch(url);
  const data = await response.json();
  const country = data.data.find(
    (c: any) =>
      c.name.toLowerCase().replace(/\s+/g, "-") === params.slug.toLowerCase()
  );
  const countryName = country?.name || params.slug;

  // Use spreadsheet template for dynamic SEO
  return generatePageMetadata({
    type: "page",
    data: {
      title: `Branded Residences Directory – ${countryName} | Luxury Listings...`,
      description: `Discover ${countryName}’s top branded residences. View detailed property listings by region, brand, and lifestyle preference.`,
      slug: `residences/country/${params.slug}`,
      keywords: ["branded residences", "luxury listings", countryName],
    },
  });
}

export default function Page(props: Record<string, unknown>) {
  return <CountryResidencesClient {...props} />;
}
