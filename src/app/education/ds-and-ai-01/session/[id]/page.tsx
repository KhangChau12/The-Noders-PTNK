import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { getCourse } from '@/lib/programs'
import { SessionPlayer } from '@/components/course/SessionPlayer'

const course = getCourse('ds-and-ai-01')

export function generateStaticParams() {
  return (course?.sessions ?? []).map((s) => ({ id: String(s.n) }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const session = course?.sessions.find((s) => String(s.n) === id)
  const title = session?.title ?? `Session ${id}`
  return generateSEOMetadata({
    title: `Session ${id}: ${title} — DS & AI`,
    description: `Session ${id} of Intro to Data Science & AI: ${session?.goal ?? title} Slides, recording, notes and practice notebook.`,
    keywords: ['data science', 'session', title],
    url: `/education/ds-and-ai-01/session/${id}`,
    image: course?.coverImage,
  })
}

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = course?.sessions.find((s) => String(s.n) === id)
  if (!course || !session) notFound()
  return <SessionPlayer course={course} session={session} />
}
