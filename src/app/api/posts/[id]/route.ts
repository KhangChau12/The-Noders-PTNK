import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// GET /api/posts/[id] - Get specific post with blocks
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if authenticated and set session for RLS
    const supabase = createClient()
    const authHeader = request.headers.get('authorization')

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: token
      })
    }

    // Get post with author and thumbnail
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
      .eq('id', id)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Get blocks
    const { data: blocks } = await supabase
      .from('post_blocks')
      .select('*')
      .eq('post_id', id)
      .order('order_index', { ascending: true })

    // Fetch images for image blocks
    const imageIds = blocks
      ?.filter(b => b.type === 'image')
      .map(b => (b.content as any).image_id)
      .filter(Boolean) || []

    let images: any[] = []
    if (imageIds.length > 0) {
      const { data: imageData } = await supabase
        .from('images')
        .select('id, public_url, alt_text, width, height')
        .in('id', imageIds)
      images = imageData || []
    }

    // Add image data to blocks
    const blocksWithImages = blocks?.map(block => {
      if (block.type === 'image') {
        const imageId = (block.content as any).image_id
        const imageData = images.find(img => img.id === imageId)
        return {
          ...block,
          image: imageData
        }
      }
      return block
    })

    // Get related posts
    const relatedPostIds = [post.related_post_id_1, post.related_post_id_2].filter(Boolean)
    let relatedPosts: any[] = []

    if (relatedPostIds.length > 0) {
      const { data } = await supabase
        .from('posts')
        .select(`
          id,
          slug,
          title,
          summary,
          category,
          thumbnail_image:images!posts_thumbnail_image_id_fkey(
            public_url
          )
        `)
        .in('id', relatedPostIds)
        .eq('status', 'published')

      relatedPosts = data || []
    }

    // Check if user has upvoted (if authenticated)
    let userHasUpvoted = false
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)

      if (user) {
        const { data: upvote } = await supabase
          .from('post_upvotes')
          .select('id')
          .eq('post_id', id)
          .eq('user_id', user.id)
          .single()

        userHasUpvoted = !!upvote
      }
    }

    return NextResponse.json({
      success: true,
      post,
      blocks: blocksWithImages || [],
      related_posts: relatedPosts,
      user_has_upvoted: userHasUpvoted
    })

  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/posts/[id] - Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: No auth token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify user
    const authClient = createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid token' },
        { status: 401 }
      )
    }

    // Create client with session for RLS
    const supabase = createClient()
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: token
    })

    // Check if user is author
    const { data: post, error: checkError } = await supabase
      .from('posts')
      .select('author_id, status')
      .eq('id', id)
      .single()

    if (checkError || !post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    if (post.author_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to update this post' },
        { status: 403 }
      )
    }

    // Parse request body
    const updates = await request.json()
    const allowedFields = [
      'title', 'summary', 'thumbnail_image_id', 'category', 'slug',
      'status', 'related_post_id_1', 'related_post_id_2', 'reading_time', 'featured'
    ]

    // Filter only allowed fields
    const postUpdates: any = {}
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        postUpdates[key] = updates[key]
      }
    })

    // Validate if updating title or summary
    if (postUpdates.title && postUpdates.title.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Title must be 100 characters or less' },
        { status: 400 }
      )
    }

    if (postUpdates.summary && postUpdates.summary.length > 300) {
      return NextResponse.json(
        { success: false, error: 'Summary must be 300 characters or less' },
        { status: 400 }
      )
    }

    // If publishing, set published_at
    if (postUpdates.status === 'published' && post.status !== 'published') {
      postUpdates.published_at = new Date().toISOString()
    }

    // Update post
    const { data: updatedPost, error: updateError } = await supabase
      .from('posts')
      .update(postUpdates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to update post: ' + updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Post updated successfully',
      post: updatedPost
    })

  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: No auth token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify user
    const authClient = createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid token' },
        { status: 401 }
      )
    }

    // Create client with session for RLS
    const supabase = createClient()
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: token
    })

    // Check if user is author
    const { data: post, error: checkError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single()

    if (checkError || !post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    if (post.author_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Only post authors can delete posts' },
        { status: 403 }
      )
    }

    // Delete post (blocks and upvotes will be cascade deleted)
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete post: ' + deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}