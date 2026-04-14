import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { ownershipCache, createOwnershipKey } from '@/lib/cache'

async function verifyPostOwnership(supabase: any, postId: string, userId: string) {
  const cacheKey = createOwnershipKey(postId, userId)
  const cached = ownershipCache.get(cacheKey)
  if (cached !== null) {
    return cached
  }

  const { data: post, error } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', postId)
    .single()

  let result: { authorized: boolean; error?: string }

  if (error || !post) {
    result = { authorized: false, error: 'Post not found' }
  } else {
    const isAuthor = post.author_id === userId

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

  ownershipCache.set(cacheKey, result)
  return result
}

async function attachImageData(supabase: any, blocks: any[]) {
  const imageIds = blocks
    .filter((block: any) => block.type === 'image' && block.content?.image_id)
    .map((block: any) => block.content.image_id)

  if (imageIds.length === 0) {
    return blocks
  }

  const { data: images } = await supabase
    .from('images')
    .select('id, public_url, alt_text, width, height')
    .in('id', imageIds)

  if (!images) {
    return blocks
  }

  return blocks.map((block: any) => {
    if (block.type !== 'image' || !block.content?.image_id) {
      return block
    }

    const image = images.find((img: any) => img.id === block.content.image_id)
    return image ? { ...block, image } : block
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: postId } = params

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    const authClient = createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient()
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: token
    })

    const ownership = await verifyPostOwnership(supabase, postId, user.id)
    if (!ownership.authorized) {
      return NextResponse.json(
        { success: false, error: ownership.error },
        { status: 403 }
      )
    }

    const { blockId, direction } = await request.json()

    if (!blockId || !['up', 'down'].includes(direction)) {
      return NextResponse.json(
        { success: false, error: 'Invalid reorder request' },
        { status: 400 }
      )
    }

    const { data: blocks, error: blocksError } = await supabase
      .from('post_blocks')
      .select('id, order_index')
      .eq('post_id', postId)
      .order('order_index', { ascending: true })

    if (blocksError || !blocks) {
      return NextResponse.json(
        { success: false, error: 'Failed to load blocks' },
        { status: 500 }
      )
    }

    const currentIndex = blocks.findIndex((block: any) => block.id === blockId)
    if (currentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Block not found' },
        { status: 404 }
      )
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= blocks.length) {
      return NextResponse.json(
        { success: false, error: 'Block cannot be moved further in that direction' },
        { status: 400 }
      )
    }

    const reorderedIds = blocks.map((block: any) => block.id)
    const [movedBlockId] = reorderedIds.splice(currentIndex, 1)
    reorderedIds.splice(targetIndex, 0, movedBlockId)

    const { error: reorderError } = await supabase.rpc('reorder_post_blocks', {
      p_post_id: postId,
      p_block_ids: reorderedIds
    })

    if (reorderError) {
      return NextResponse.json(
        { success: false, error: 'Failed to reorder blocks: ' + reorderError.message },
        { status: 500 }
      )
    }

    const { data: reorderedBlocks, error: reloadError } = await supabase
      .from('post_blocks')
      .select('*')
      .eq('post_id', postId)
      .order('order_index', { ascending: true })

    if (reloadError || !reorderedBlocks) {
      return NextResponse.json(
        { success: false, error: 'Block reorder succeeded but reload failed' },
        { status: 500 }
      )
    }

    const blocksWithImages = await attachImageData(supabase, reorderedBlocks)

    return NextResponse.json({
      success: true,
      message: 'Block order updated successfully',
      blocks: blocksWithImages
    })
  } catch (error) {
    console.error('Error reordering blocks:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
