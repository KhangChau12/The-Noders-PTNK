import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { getContest } from '@/lib/programs'
import { ContestDetail } from '@/components/contest/ContestDetail'

const contest = getContest('naic-2025')

export const metadata: Metadata = generateSEOMetadata({
  title: 'Noders AI Challenge 2025',
  description: contest?.pitch ?? '',
  keywords: ['AI challenge', 'AI competition', 'PTNK', 'machine learning', 'IELTS essay scoring', 'Noders AI Challenge 2025'],
  url: '/contest/naic-2025',
})

export default function NAIC2025Page() {
  if (!contest) notFound()
  return <ContestDetail contest={contest} />
}
