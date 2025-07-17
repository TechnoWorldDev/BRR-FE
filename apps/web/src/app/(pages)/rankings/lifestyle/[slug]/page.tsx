import { generatePageMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'
import SingleBestResidencesClient from '../../[slug]/SingleBestResidencesClient';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Fetch lifestyle data as before...
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v1";
  const res = await fetch(`${baseUrl}/api/${apiVersion}/ranking-categories/slug/${params.slug}`, { cache: "no-store" });
  const data = await res.json();
  const lifestyleName = data?.data?.name;
  
  // Use spreadsheet template for dynamic SEO
  return generatePageMetadata({
    type: 'page',
    data: {
      title: `Best Branded Residences for ${lifestyleName} – Rankings & Listings`,
      description: `Explore the best branded residences for ${lifestyleName}. Discover top properties, expert reviews, and lifestyle-focused rankings.`,
      slug: `best-residences/lifestyle/${params.slug}`,
      keywords: ['lifestyle', 'branded residences', lifestyleName]
    }
  });
}

export default function CategoryPage() {
    return <SingleBestResidencesClient />
  }
  