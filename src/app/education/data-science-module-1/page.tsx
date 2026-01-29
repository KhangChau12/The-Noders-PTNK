import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { DataScienceModule1Content } from './content' 

export const metadata: Metadata = generateSEOMetadata({
  title: 'Introduction to Data Science - Module 1',
  description: 'Build a solid foundation in data science with comprehensive training on structured data, computer vision, and NLP. 4-session mini-course for high school students.',
  keywords: ['data science course', 'machine learning training', 'student workshop', 'Python data analysis', 'AI education'],
  url: '/education/data-science-module-1',
})

export default function DataScienceModule1Page() {
  return <DataScienceModule1Content />
}
