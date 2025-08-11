import type { Metadata } from 'next'
import SlugClient from "./SlugClient";
import { generatePageMetadata } from '@/lib/metadata'

interface Continent {
  id: string;
  name: string;
  slug: string;
}

interface ContinentResponse {
  data: Continent[];
  statusCode: number;
  message: string;
}

interface PageProps {
  params: { slug: string };
}

// Funkcija za generisanje meta podataka
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Fetch continent data as before...
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v1";
  const url = `${baseUrl}/api/${apiVersion}/public/continents?limit=10`;
  const response = await fetch(url);
  const data = await response.json();
  const continent = data.data.find((c: any) =>
    c.name.toLowerCase().replace(/\s+/g, "-") === params.slug.toLowerCase()
  );
  const continentName = continent?.name || params.slug;

  // Use spreadsheet template for dynamic SEO
  return generatePageMetadata({
    type: 'page',
    data: {
      title: `Rankings of the Best Branded Residences in ${continentName}`,
      description: `Explore the best branded residences in ${continentName}. View top listings, rankings, and reviews for luxury properties across the continent.`,
      slug: `residences/continent/${params.slug}`,
      keywords: ['continent', 'branded residences', continentName]
    }
  });
}

// Funkcija za generisanje statičnih putanja
export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v1";
    const url = `${baseUrl}/api/${apiVersion}/continents`;
    const response = await fetch(url);
    const data: ContinentResponse = await response.json();
    
    // Generiši putanje za sve kontinente
    const continentPaths = data.data.map((continent) => ({
      slug: continent.name.toLowerCase().replace(/\s+/g, "-"),
    }));
    
    // Dodaj worldwide putanju
    return [
      { slug: "worldwide" },
      ...continentPaths,
    ];
  } catch (error) {
    console.error("Error generating static params:", error);
    // Fallback - vrati samo worldwide
    return [{ slug: "worldwide" }];
  }
}

export default function ContinentResidencesPage() {
  return <SlugClient />;
}