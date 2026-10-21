'use client'

import { useParams } from 'next/navigation'
import { PostEditor } from '@/components/dashboard/PostEditor'

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  return <PostEditor key={id} postId={id} />
}
