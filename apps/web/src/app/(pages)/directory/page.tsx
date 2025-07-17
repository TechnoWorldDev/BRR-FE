import ResidencesClient from "./ResidencesClient";
import { generatePageMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  type: 'page',
  data: {
    title: 'Residences Directory – Best Branded Residences', // Example SEO title
    description: 'Browse our directory of the world’s best branded residences. Find luxury homes by country, city, lifestyle, or brand.', // Example SEO description
    slug: 'residences',
    keywords: ['residences', 'luxury residences', 'directory']
  }
})

export default function ResidencesPage() {
  return <ResidencesClient />
}