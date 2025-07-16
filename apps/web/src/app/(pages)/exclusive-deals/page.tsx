import ExclusiveDealsClient from "./ExclusiveDealsClient";
import { generatePageMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  type: 'page',
  data: {
    title: 'Exclusive Deals on Luxury Branded Residences | BBR',
    description: 'Explore exclusive deals on luxury branded residences with Best Branded Residences (BBR). Access premium offers on high-end homes from world-renowned brands...',
    slug: 'exclusive-deals',
    keywords: ['exclusive deals', 'luxury residences', 'branded residences']
  }
})

export default function ExclusiveDealsPage() {
  return <ExclusiveDealsClient />
} 