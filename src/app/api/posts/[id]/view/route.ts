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

    // Call the PostgreSQL function to increment view count
    // This function bypasses RLS using SECURITY DEFINER
    const { data, error } = await supabase
      .rpc('increment_post_view_count', { post_id_param: postId })

    if (error) {
      console.error('Failed to increment view count:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update view count' },
        { status: 500 }
      )
    }

    // If data is null, post was not found or not published
    if (data === null) {
      return NextResponse.json(
        { success: false, error: 'Post not found or not published' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      view_count: data
    })

  } catch (error) {
    console.error('Error incrementing view count:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
