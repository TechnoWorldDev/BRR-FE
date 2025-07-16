import SingleResidenceClient from "./SingleResidenceClient";
import { generatePageMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v1";
  const res = await fetch(`${baseUrl}/api/${apiVersion}/public/residences/slug/${params.slug}`, { cache: "no-store" });
  const data = await res.json();
  const residence = data.data;

  // Use spreadsheet template for dynamic SEO
  const title = residence?.name
    ? `${residence.name} – Reviewed ${residence.type || 'Branded Residence'} in ${residence.location || ''}`
    : 'Luxury Residence – Best Branded Residences';
  const description = residence?.name
    ? `Explore our expert review of ${residence.name}. Discover why these ${residence.type || 'residences'} are among ${residence.location || 'the world’s'} top branded properties.`
    : 'Discover this luxury branded residence.';

  const featuredImage = residence?.featuredImage?.id
    ? `${baseUrl}/api/${apiVersion}/media/${residence.featuredImage.id}/content`
    : undefined;

  return generatePageMetadata({
    type: 'page',
    data: {
      title,
      description,
      slug: `residences/${params.slug}`,
      keywords: ['residence', 'luxury residences', 'branded residences', residence?.name],
      image: featuredImage
    }
  });
}

export default function ResidencePage() {
  return <SingleResidenceClient />
}