import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Contact Us',
  description: 'Have a question, want to join our club, or interested in collaboration? Get in touch with The Noders PTNK. We respond within 24 hours.',
  keywords: ['contact', 'get in touch', 'join club', 'collaboration', 'inquiries'],
  url: '/contact',
})

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
