import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// GET /api/posts/by-slug/[slug] - Get post by slug with all details in one request
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const supabase = createClient()

    // Check if user is authenticated
    const authHeader = request.headers.get('authorization')
    let userId: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id || null
    }

    // Single optimized query - get post with all related data
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        ),
        thumbnail_image:images!posts_thumbnail_image_id_fkey(
          id,
          filename,
          public_url,
          width,
          height,
          alt_text
        )
      `)
      .eq('slug', slug)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if user can view this post
    const canView = (post as any).status === 'published' || (post as any).author_id === userId

    if (!canView) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Fetch blocks and upvote status in parallel for better performance
    const [blocksResult, upvoteResult] = await Promise.all([
      // Get blocks (images are stored in content JSONB, not as FK)
      supabase
        .from('post_blocks')
        .select('*')
        .eq('post_id', (post as any).id)
        .order('order_index', { ascending: true }),

      // Check if user has upvoted (only if authenticated)
      userId
        ? supabase
            .from('post_upvotes')
            .select('id')
            .eq('post_id', (post as any).id)
            .eq('user_id', userId)
            .single()
        : Promise.resolve({ data: null, error: null })
    ])

    let blocks: any[] = blocksResult.data || []
    const userHasUpvoted = !!upvoteResult.data

    if (blocksResult.error) {
      console.error('Error fetching blocks:', blocksResult.error)
    }

    // Fetch images for image blocks (if any)
    if (blocks.length > 0) {
      const imageBlocks = blocks.filter((b: any) => b.type === 'image')
      const imageIds = imageBlocks
        .map((b: any) => b.content?.image_id)
        .filter(Boolean)

      if (imageIds.length > 0) {
        const { data: images } = await supabase
          .from('images')
          .select('*')
          .in('id', imageIds)

        // Attach images to blocks
        if (images) {
          blocks = blocks.map((block: any) => {
            if (block.type === 'image' && block.content?.image_id) {
              const image = images.find((img: any) => img.id === block.content.image_id)
              if (image) {
                return { ...block, image }
              }
            }
            return block
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      post,
      blocks: blocks || [],
      user_has_upvoted: userHasUpvoted
    })

  } catch (error) {
    console.error('Error fetching post by slug:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
