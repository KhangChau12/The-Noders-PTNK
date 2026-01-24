import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import PAIC2026Content from './content'

export const metadata: Metadata = generateSEOMetadata({
  title: 'PAIC 2026 - PTNK AI Challenge 2026',
  description: 'Kỳ thi học thuật về Trí tuệ Nhân tạo do CLB The Noders tổ chức. Giải thưởng đến 1,800,000 VNĐ. Dành cho học sinh PTNK yêu thích AI.',
  keywords: ['AI challenge', 'cuộc thi AI', 'học sinh PTNK', 'kỳ thi AI', 'machine learning', 'PAIC 2026'],
  url: '/contest/paic-2026',
})

export default function PAIC2026Page() {
  return <PAIC2026Content />
}
