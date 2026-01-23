import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { NAIC2025Content } from './content' 

export const metadata: Metadata = generateSEOMetadata({
  title: 'Noders AI Competition 2025 - Internal Competition',
  description: 'Internal AI competition for The Noders PTNK members. Build IELTS Writing scoring models and compete for cash prizes in a supportive learning environment.',
  keywords: ['internal competition', 'AI challenge', 'Noders PTNK', 'machine learning', 'IELTS scoring'],
  url: '/contest/naic-2025',
})

export default function NAIC2025Page() {
  return <NAIC2025Content />
}
