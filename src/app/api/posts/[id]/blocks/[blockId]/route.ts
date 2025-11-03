import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { ownershipCache, createOwnershipKey } from '@/lib/cache'

// Helper to verify post ownership with caching
async function verifyPostOwnership(supabase: any, postId: string, userId: string) {
  // Check cache first
  const cacheKey = createOwnershipKey(postId, userId)
  const cached = ownershipCache.get(cacheKey)
  if (cached !== null) {
    return cached
  }

  // Not in cache, query database
  const { data: post, error } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', postId)
    .single()

  let result: { authorized: boolean; error?: string }

  if (error || !post) {
    result = { authorized: false, error: 'Post not found' }
  } else {
    // Check if user is author
    const isAuthor = post.author_id === userId

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    const isAdmin = profile?.role === 'admin'

    if (isAuthor || isAdmin) {
      result = { authorized: true }
    } else {
      result = { authorized: false, error: 'You do not have permission to modify this post' }
    }
  }

  // Cache the result
  ownershipCache.set(cacheKey, result)
  return result
}

// PUT /api/posts/[id]/blocks/[blockId] - Update block
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string, blockId: string } }
) {
  try {
    const { id: postId, blockId } = params

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

    // Get existing block
    const { data: existingBlock, error: blockError } = await supabase
      .from('post_blocks')
      .select('*')
      .eq('id', blockId)
      .eq('post_id', postId)
      .single()

    if (blockError || !existingBlock) {
      return NextResponse.json(
        { success: false, error: 'Block not found' },
        { status: 404 }
      )
    }

    // Parse request body
    const updates = await request.json()
    const { content, order_index } = updates

    const blockUpdates: any = {}

    // Update content if provided
    if (content) {
      // Validate content based on type
      if (existingBlock.type === 'text' && content.word_count > 800) {
        return NextResponse.json(
          { success: false, error: 'Text block cannot exceed 800 words' },
          { status: 400 }
        )
      }

      blockUpdates.content = content
    }

    // Update order_index if provided
    if (order_index !== undefined) {
      blockUpdates.order_index = order_index
    }

    // Update block
    const { data: updatedBlock, error: updateError } = await supabase
      .from('post_blocks')
      .update(blockUpdates)
      .eq('id', blockId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to update block: ' + updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Block updated successfully',
      block: updatedBlock
    })

  } catch (error) {
    console.error('Error updating block:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/[id]/blocks/[blockId] - Delete block
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string, blockId: string } }
) {
  try {
    const { id: postId, blockId } = params

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

    // Delete block
    const { error: deleteError } = await supabase
      .from('post_blocks')
      .delete()
      .eq('id', blockId)
      .eq('post_id', postId)

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete block: ' + deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Block deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting block:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}