import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// POST /api/posts/[id]/view - Increment view count
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: postId } = params
    const supabase = createClient()

    // Get current post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, view_count, status')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Only increment for published posts
    if (post.status !== 'published') {
      return NextResponse.json({
        success: true,
        view_count: post.view_count
      })
    }

    // Increment view count
    const newViewCount = (post.view_count || 0) + 1
    const { error: updateError } = await supabase
      .from('posts')
      .update({ view_count: newViewCount })
      .eq('id', postId)

    if (updateError) {
      console.error('Failed to update view count:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update view count' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      view_count: newViewCount
    })

  } catch (error) {
    console.error('Error incrementing view count:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
