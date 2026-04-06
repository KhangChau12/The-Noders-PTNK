import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { SessionDetailContent } from './content'

const sessionTitles: Record<string, string> = {
  '1': 'Data Science Thinking & Standard Workflows',
  '2': 'Data Processing & Visualization',
  '3': 'Computer Vision & Basic Machine Learning',
  '4': 'Natural Language Processing & Model Evaluation',
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const title = sessionTitles[id] ?? `Session ${id}`
  return generateSEOMetadata({
    title: `Session ${id}: ${title} — Data Science Module 1`,
    description: `Session ${id} of Data Science Module 1: ${title}. Slides, video recording, and lecture notes.`,
    keywords: ['data science', 'session', title],
    url: `/education/data-science-module-1/session/${id}`,
    image: '/images/education/data-science-module-1/cover.png',
  })
}

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <SessionDetailContent sessionId={id} />
}
