import * as S from '@/components/skeletons'
export default function P({ params }: { params: { name: string } }) {
  const C = (S as any)[params.name]
  return <C />
}
