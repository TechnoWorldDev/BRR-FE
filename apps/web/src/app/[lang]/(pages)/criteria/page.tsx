import type { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/metadata'
import EvaluationCriteriaClient from './EvaluationCriteriaClient'

export const metadata: Metadata = generatePageMetadata({
  type: 'page',
  data: {
    title: 'Evaluation Criteria – Best Branded Residences', // Updated for SEO
    description: 'Discover the standards and methodology we use to rank and review the world’s best branded residences. Learn about our expert evaluation process.', // Updated for SEO
    slug: 'criteria',
    keywords: ['evaluation criteria', 'luxury residences', 'ranking process', 'branded residences']
  }
});

export default function EvaluationCriteriaPage() {
  return <EvaluationCriteriaClient />
}