import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// POST /api/posts/[id]/upvote - Toggle upvote
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: postId } = params

    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please sign in to upvote' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient()

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid token' },
        { status: 401 }
      )
    }

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, upvote_count')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if user already upvoted
    const { data: existingUpvote } = await supabase
      .from('post_upvotes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    let upvoted = false
    let newUpvoteCount = post.upvote_count

    if (existingUpvote) {
      // Remove upvote
      const { error: deleteError } = await supabase
        .from('post_upvotes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)

      if (deleteError) {
        return NextResponse.json(
          { success: false, error: 'Failed to remove upvote' },
          { status: 500 }
        )
      }

      newUpvoteCount = Math.max(0, post.upvote_count - 1)
      upvoted = false

    } else {
      // Add upvote
      const { error: insertError } = await supabase
        .from('post_upvotes')
        .insert({
          post_id: postId,
          user_id: user.id
        })

      if (insertError) {
        return NextResponse.json(
          { success: false, error: 'Failed to add upvote' },
          { status: 500 }
        )
      }

      newUpvoteCount = post.upvote_count + 1
      upvoted = true
    }

    // Update cached upvote count in posts table
    const { error: updateError } = await supabase
      .from('posts')
      .update({ upvote_count: newUpvoteCount })
      .eq('id', postId)

    if (updateError) {
      console.error('Failed to update upvote count:', updateError)
    }

    return NextResponse.json({
      success: true,
      upvoted,
      upvote_count: newUpvoteCount
    })

  } catch (error) {
    console.error('Error toggling upvote:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/posts/[id]/upvote - Get upvote status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: postId } = params
    const supabase = createClient()

    // Get upvote count
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('upvote_count')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if user has upvoted (if authenticated)
    let userHasUpvoted = false
    const authHeader = request.headers.get('authorization')

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)

      if (user) {
        const { data: upvote } = await supabase
          .from('post_upvotes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single()

        userHasUpvoted = !!upvote
      }
    }

    return NextResponse.json({
      success: true,
      upvote_count: post.upvote_count,
      user_has_upvoted: userHasUpvoted
    })

  } catch (error) {
    console.error('Error fetching upvote status:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}