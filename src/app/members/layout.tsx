import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Meet Our Team',
  description: 'Get to know the passionate individuals behind The Noders PTNK. Our diverse team brings together expertise from various fields to create amazing projects.',
  keywords: ['team members', 'developers', 'students', 'AI enthusiasts', 'PTNK members'],
  url: '/members',
})

// Force dynamic rendering, disable all caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
