import SingleBrandClient from "./SingleBrandClient";
import { generatePageMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Fetch brand data as before...
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v1";
  const url = `${baseUrl}/api/${apiVersion}/public/brands/slug/${params.slug}`;
  const response = await fetch(url);
  const data = await response.json();
  const brand = data.data;
  const brandName = brand?.name || params.slug;

  // Use spreadsheet template for dynamic SEO
  return generatePageMetadata({
    type: 'page',
    data: {
      title: `Branded Residences by ${brandName} – Rankings & Listings | BBR`,
      description: `Explore luxury branded residences by ${brandName}. View exclusive listings, rankings, and reviews for top properties worldwide.`,
      slug: `brands/${params.slug}`,
      keywords: ['brand', 'branded residences', brandName]
    }
  });
}

export default function BrandPage({ params }: { params: { slug: string } }) {
  return <SingleBrandClient />
}