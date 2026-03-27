import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Our Products',
  description: 'Explore the innovative products created by The Noders Community members. From machine learning models to web applications, discover our collaborative work.',
  keywords: ['student projects', 'AI projects', 'web development', 'mobile apps', 'open source'],
  url: '/products',
})

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
