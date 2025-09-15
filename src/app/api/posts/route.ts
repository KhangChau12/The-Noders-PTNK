import { NextRequest, NextResponse } from 'next/server'
import { getAllPosts, searchPosts, getPostsByCategory } from '@/lib/posts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let posts

    if (search) {
      posts = searchPosts(search)
    } else if (category && category !== 'all') {
      posts = getPostsByCategory(category)
    } else {
      posts = getAllPosts()
    }

    return NextResponse.json({
      success: true,
      posts,
      total: posts.length
    })

  } catch (error) {
    console.error('Error fetching posts:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch posts',
        posts: [],
        total: 0
      },
      { status: 500 }
    )
  }
}