import type { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/metadata'
import BrandsClient from "./BrandsClent";

export const metadata: Metadata = generatePageMetadata({
  type: 'page',
  data: {
    title: 'Rankings of the Best Branded Residences by Brands | BBR', // Updated from spreadsheet
    description: 'Explore rankings of the Best Branded Residences by top brands, featuring luxury properties with premium lifestyles and exclusive real estate worldwide.', // Updated from spreadsheet
    slug: 'brands',
    keywords: ['brands', 'luxury residences', 'branded residences']
  }
})

export default function BrandsPage() {
  return <BrandsClient />
}