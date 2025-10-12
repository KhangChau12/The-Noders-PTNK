import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Posts & Updates',
  description: 'Stay updated with the latest news, educational content, member spotlights, and community activities from The Noders PTNK.',
  keywords: ['tech blog', 'student posts', 'AI news', 'tech articles', 'community updates'],
  url: '/posts',
})

export default function PostsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
