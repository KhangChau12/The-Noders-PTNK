import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { getContest } from '@/lib/programs'
import { ContestDetail } from '@/components/contest/ContestDetail'

const contest = getContest('paic-2026')

export const metadata: Metadata = generateSEOMetadata({
  title: 'PAIC 2026 - PTNK AI Challenge 2026',
  description: contest?.pitch ?? '',
  keywords: ['AI challenge', 'AI competition', 'PTNK', 'machine learning', 'IELTS essay scoring', 'PAIC 2026'],
  url: '/contest/paic-2026',
})

export default function PAIC2026Page() {
  if (!contest) notFound()
  return <ContestDetail contest={contest} />
}
