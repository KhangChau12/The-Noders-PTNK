import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { getCourse } from '@/lib/programs'
import { CourseDetail } from '@/components/course/CourseDetail'

const course = getCourse('ds-and-ai-01')

export const metadata: Metadata = generateSEOMetadata({
  title: 'Introduction to Data Science and Artificial Intelligence',
  description: 'A free 4-session course on tabular data, computer vision and NLP for high-school students. Slides, recordings, notes and Colab notebooks for every session.',
  keywords: ['data science course', 'machine learning training', 'student workshop', 'Python data analysis', 'AI education'],
  url: '/education/ds-and-ai-01',
  image: course?.coverImage,
})

export default function DataScienceModule1Page() {
  if (!course) notFound()
  return <CourseDetail course={course} />
}
