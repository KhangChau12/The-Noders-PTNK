import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Our Projects',
  description: 'Explore the innovative projects created by The Noders PTNK members. From machine learning models to web applications, discover our collaborative work.',
  keywords: ['student projects', 'AI projects', 'web development', 'mobile apps', 'open source'],
  url: '/projects',
})

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
