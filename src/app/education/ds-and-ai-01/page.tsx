import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { DataScienceModule1Content } from './content' 

export const metadata: Metadata = generateSEOMetadata({
  title: 'Introduction to Data Science and Artificial Intelligence',
  description: 'Build a solid foundation in data science with comprehensive training on structured data, computer vision, and NLP. 4-session mini-course for high school students.',
  keywords: ['data science course', 'machine learning training', 'student workshop', 'Python data analysis', 'AI education'],
  url: '/education/ds-and-ai-01',
  image: '/images/education/data-science-module-1/cover.png',
})

export default function DataScienceModule1Page() {
  return <DataScienceModule1Content />
}
