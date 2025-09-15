import { NextRequest, NextResponse } from 'next/server'
import { getPostBySlug } from '@/lib/posts'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = getPostBySlug(params.slug)

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          error: 'Post not found',
          post: null
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      post
    })

  } catch (error) {
    console.error('Error fetching post:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch post',
        post: null
      },
      { status: 500 }
    )
  }
}