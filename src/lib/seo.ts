import { Metadata } from 'next'
import { SITE_CONFIG } from './constants'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  noIndex?: boolean
}

/**
 * Generate comprehensive metadata for SEO
 */
export function generateMetadata({
  title,
  description = SITE_CONFIG.description,
  keywords = [],
  image = SITE_CONFIG.ogImage,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author = SITE_CONFIG.author,
  noIndex = false,
}: SEOProps = {}): Metadata {
  const fullTitle = title
    ? `${title} | ${SITE_CONFIG.name}`
    : `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`

  const fullUrl = url
    ? `${SITE_CONFIG.url}${url}`
    : SITE_CONFIG.url

  const fullImage = image?.startsWith('http')
    ? image
    : `${SITE_CONFIG.url}${image}`

  const allKeywords = [...SITE_CONFIG.keywords, ...keywords]

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: [{ name: author }],
    creator: author,
    publisher: SITE_CONFIG.name,

    // Robots
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },

    // Open Graph
    openGraph: {
      type,
      locale: SITE_CONFIG.locale,
      url: fullUrl,
      title: fullTitle,
      description,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title || SITE_CONFIG.name,
        },
      ],
      ...(type === 'article' && publishedTime && {
        publishedTime,
        modifiedTime,
        authors: [author],
      }),
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      site: SITE_CONFIG.twitterHandle,
      creator: SITE_CONFIG.twitterHandle,
      title: fullTitle,
      description,
      images: [fullImage],
    },

    // Canonical URL
    alternates: {
      canonical: fullUrl,
    },

    // Additional metadata
    metadataBase: new URL(SITE_CONFIG.url),
  }
}

/**
 * Generate JSON-LD structured data for Organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    description: SITE_CONFIG.description,
    sameAs: [
      // Add social media links here when available
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'phuckhangtdn@gmail.com',
      contactType: 'General Inquiry',
    },
  }
}

/**
 * Generate JSON-LD structured data for Article (Blog Post)
 */
export function generateArticleSchema({
  title,
  description,
  url,
  image,
  publishedTime,
  modifiedTime,
  author,
}: {
  title: string
  description: string
  url: string
  image?: string
  publishedTime: string
  modifiedTime?: string
  author: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: `${SITE_CONFIG.url}${url}`,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/logo.png`,
      },
    },
    image: image ? (image.startsWith('http') ? image : `${SITE_CONFIG.url}${image}`) : undefined,
  }
}

/**
 * Generate JSON-LD structured data for Person (Member Profile)
 */
export function generatePersonSchema({
  name,
  username,
  bio,
  image,
  url,
}: {
  name: string
  username: string
  bio?: string
  image?: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    alternateName: username,
    description: bio,
    image: image || undefined,
    url: `${SITE_CONFIG.url}${url}`,
    memberOf: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
    },
  }
}

/**
 * Generate JSON-LD structured data for Project
 */
export function generateProjectSchema({
  name,
  description,
  url,
  image,
  dateCreated,
  techStack,
}: {
  name: string
  description: string
  url: string
  image?: string
  dateCreated: string
  techStack?: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url: `${SITE_CONFIG.url}${url}`,
    image: image || undefined,
    dateCreated,
    applicationCategory: 'DeveloperApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    keywords: techStack?.join(', '),
  }
}

/**
 * Generate breadcrumb JSON-LD structured data
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.url}`,
    })),
  }
}
