// app/sitemap.ts
import { MetadataRoute } from 'next'

// Helper funkcija za pravilno spajanje URL-ova
function joinUrls(baseUrl: string, path: string): string {
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

// Kreiraj dummy funkcije ili pozovi stvarne API-jeve
async function getAllResidences() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}/public/residences?limit=1000`)
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching residences for sitemap:', error)
    return []
  }
}

async function getAllCategories() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}/public/ranking-categories?limit=1000`)
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bestbrandedresidences.com'
  
  try {
    // Fetch dynamic routes
    const residences = await getAllResidences()
    const categories = await getAllCategories()
    
    const residenceUrls = residences.map((residence: any) => ({
      url: joinUrls(baseUrl, `/directory/${residence.slug}`),
      lastModified: new Date(residence.updatedAt || Date.now()),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
    
    const categoryUrls = categories.map((category: any) => ({
      url: joinUrls(baseUrl, `/rankings/${category.slug}`),
      lastModified: new Date(category.updatedAt || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [
      {
        url: joinUrls(baseUrl, '/'),
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: joinUrls(baseUrl, '/residences'),
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: joinUrls(baseUrl, '/best-residences'),
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      ...residenceUrls,
      ...categoryUrls,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return [
      {
        url: joinUrls(baseUrl, '/'),
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  }
}