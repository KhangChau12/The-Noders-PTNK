import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// Helper to verify post ownership
async function verifyPostOwnership(supabase: any, postId: string, userId: string) {
  const { data: post, error } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', postId)
    .single()

  if (error || !post) {
    return { authorized: false, error: 'Post not found' }
  }

  if (post.author_id !== userId) {
    return { authorized: false, error: 'You do not have permission to modify this post' }
  }

  return { authorized: true }
}

// GET /api/posts/[id]/blocks - Get all blocks for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = createClient()

    const { data: blocks, error } = await supabase
      .from('post_blocks')
      .select('*')
      .eq('post_id', id)
      .order('order_index', { ascending: true })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      blocks: blocks || []
    })

  } catch (error) {
    console.error('Error fetching blocks:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/posts/[id]/blocks - Add new block
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
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify user
    const authClient = createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create client with session for RLS
    const supabase = createClient()
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: token
    })

    // Verify post ownership
    const ownership = await verifyPostOwnership(supabase, postId, user.id)
    if (!ownership.authorized) {
      return NextResponse.json(
        { success: false, error: ownership.error },
        { status: 403 }
      )
    }

    // Parse request body
    const { type, content, order_index } = await request.json()

    // Validate block type
    const validTypes = ['text', 'quote', 'image', 'youtube']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid block type' },
        { status: 400 }
      )
    }

    // Validate content based on type
    if (type === 'text') {
      if (!content.html || !content.word_count) {
        return NextResponse.json(
          { success: false, error: 'Text block requires html and word_count' },
          { status: 400 }
        )
      }
      if (content.word_count > 800) {
        return NextResponse.json(
          { success: false, error: 'Text block cannot exceed 800 words' },
          { status: 400 }
        )
      }
    }

    if (type === 'quote' && !content.quote) {
      return NextResponse.json(
        { success: false, error: 'Quote block requires quote text' },
        { status: 400 }
      )
    }

    if (type === 'image' && !content.image_id) {
      return NextResponse.json(
        { success: false, error: 'Image block requires image_id' },
        { status: 400 }
      )
    }

    if (type === 'youtube') {
      if (!content.youtube_url || !content.video_id) {
        return NextResponse.json(
          { success: false, error: 'YouTube block requires youtube_url and video_id' },
          { status: 400 }
        )
      }
    }

    // Check total blocks count constraint (max 15)
    const { count: totalBlocks } = await supabase
      .from('post_blocks')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)

    if ((totalBlocks || 0) >= 15) {
      return NextResponse.json(
        { success: false, error: 'Maximum 15 blocks allowed per post' },
        { status: 400 }
      )
    }

    // Check image block count constraint (max 5)
    if (type === 'image') {
      const { count: imageCount } = await supabase
        .from('post_blocks')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
        .eq('type', 'image')

      if ((imageCount || 0) >= 5) {
        return NextResponse.json(
          { success: false, error: 'Maximum 5 image blocks allowed per post' },
          { status: 400 }
        )
      }
    }

    // Check consecutive text blocks constraint
    if (type === 'text' && order_index > 0) {
      const { data: previousBlock } = await supabase
        .from('post_blocks')
        .select('type')
        .eq('post_id', postId)
        .eq('order_index', order_index - 1)
        .single()

      if (previousBlock && previousBlock.type === 'text') {
        return NextResponse.json(
          { success: false, error: 'Cannot add consecutive text blocks. Please insert a different block type between text blocks.' },
          { status: 400 }
        )
      }
    }

    // Insert block
    const { data: newBlock, error: insertError } = await supabase
      .from('post_blocks')
      .insert({
        post_id: postId,
        type,
        content,
        order_index
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { success: false, error: 'Failed to create block: ' + insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Block created successfully',
      block: newBlock
    })

  } catch (error) {
    console.error('Error creating block:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}