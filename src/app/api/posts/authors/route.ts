import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/posts/authors - Get list of authors who have published posts
export async function GET() {
  try {
    const supabase = createClient()

    // Get all unique authors who have published posts
    const { data: authors, error } = await supabase
      .from('posts')
      .select(`
        author_id,
        author:profiles!posts_author_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('status', 'published')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Get unique authors and count their posts
    const authorMap = new Map()

    console.log(authors);

    authors?.forEach((post: any) => {
      if (post.author) {
        const authorId = post.author.id
        if (authorMap.has(authorId)) {
          authorMap.get(authorId).post_count++
        } else {
          authorMap.set(authorId, {
            id: post.author.id,
            username: post.author.username,
            full_name: post.author.full_name,
            avatar_url: post.author.avatar_url,
            post_count: 1
          })
        }
      }
    })

    // Convert map to array and sort by post count (descending)
    const uniqueAuthors = Array.from(authorMap.values())
      .sort((a, b) => b.post_count - a.post_count)

    return NextResponse.json({
      success: true,
      authors: uniqueAuthors
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error fetching authors:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
