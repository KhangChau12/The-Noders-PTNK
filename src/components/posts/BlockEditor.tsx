'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { PostBlock } from '@/types/database'
import { TextBlockEditor } from './blocks/TextBlockEditor'
import { QuoteBlockEditor } from './blocks/QuoteBlockEditor'
import { ImageBlockEditor } from './blocks/ImageBlockEditor'
import { YouTubeBlockEditor } from './blocks/YouTubeBlockEditor'
import { Plus, Type, Quote, Image, Youtube, AlertCircle } from 'lucide-react'

interface BlockEditorProps {
  blocks: PostBlock[]
  postId: string
  onBlocksChange: (blocks?: PostBlock[]) => void
  session: any
}

export function BlockEditor({ blocks, postId, onBlocksChange, session }: BlockEditorProps) {
  const [addingBlockType, setAddingBlockType] = useState<string | null>(null)
  const [savingBlockId, setSavingBlockId] = useState<string | null>(null)
  const [localBlocks, setLocalBlocks] = useState<PostBlock[]>(blocks)
  const [optimisticUpdates, setOptimisticUpdates] = useState<Set<string>>(new Set())

  // Update local blocks when props change
  if (blocks !== localBlocks && optimisticUpdates.size === 0) {
    setLocalBlocks(blocks)
  }

  const imageBlockCount = localBlocks.filter(b => b.type === 'image').length
  const canAddImage = imageBlockCount < 5
  const canAddBlock = localBlocks.length < 15

  // Client-side validation
  const validateBlock = useCallback((type: string, content: any, order_index?: number) => {
    // Check max blocks
    if (localBlocks.length >= 15) {
      return { valid: false, error: 'Maximum 15 blocks per post' }
    }

    // Check max images
    if (type === 'image' && imageBlockCount >= 5) {
      return { valid: false, error: 'Maximum 5 image blocks per post' }
    }

    // Check consecutive text blocks
    if (type === 'text' && localBlocks.length > 0) {
      const lastBlock = localBlocks[localBlocks.length - 1]
      if (lastBlock.type === 'text') {
        return { valid: false, error: 'Cannot add consecutive text blocks. Please add a different block type.' }
      }
    }

    // Validate content
    if (type === 'text' && (!content.html || !content.word_count)) {
      return { valid: false, error: 'Text block requires content' }
    }

    if (type === 'text' && content.word_count > 800) {
      return { valid: false, error: 'Text block cannot exceed 800 words' }
    }

    if (type === 'quote' && !content.quote) {
      return { valid: false, error: 'Quote block requires quote text' }
    }

    if (type === 'image' && !content.image_id) {
      return { valid: false, error: 'Image block requires image_id' }
    }

    if (type === 'youtube' && (!content.youtube_url || !content.video_id)) {
      return { valid: false, error: 'YouTube block requires URL and video ID' }
    }

    return { valid: true }
  }, [localBlocks, imageBlockCount])

  const handleAddBlock = async (type: string, content: any) => {
    // Client-side validation
    const validation = validateBlock(type, content)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    // Generate temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`
    const order_index = localBlocks.length

    // Optimistic update: Add block immediately to UI
    const optimisticBlock: PostBlock = {
      id: tempId,
      post_id: postId,
      type: type as any,
      content,
      order_index,
      created_at: new Date().toISOString()
    }

    setLocalBlocks(prev => [...prev, optimisticBlock])
    setOptimisticUpdates(prev => new Set(prev).add(tempId))
    setAddingBlockType(null) // Close form immediately

    try {
      const response = await fetch(`/api/posts/${postId}/blocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          type,
          content,
          order_index
        })
      })

      const result = await response.json()

      if (result.success) {
        // Replace temp block with real block from server
        setLocalBlocks(prev =>
          prev.map(b => b.id === tempId ? result.block : b)
        )
        setOptimisticUpdates(prev => {
          const newSet = new Set(prev)
          newSet.delete(tempId)
          return newSet
        })
        // Notify parent with updated blocks
        onBlocksChange(localBlocks.map(b => b.id === tempId ? result.block : b))
      } else {
        // Rollback on error
        setLocalBlocks(prev => prev.filter(b => b.id !== tempId))
        setOptimisticUpdates(prev => {
          const newSet = new Set(prev)
          newSet.delete(tempId)
          return newSet
        })
        alert('Failed to add block: ' + result.error)
        setAddingBlockType(type) // Re-open form
      }
    } catch (error) {
      // Rollback on error
      setLocalBlocks(prev => prev.filter(b => b.id !== tempId))
      setOptimisticUpdates(prev => {
        const newSet = new Set(prev)
        newSet.delete(tempId)
        return newSet
      })
      alert('Error adding block')
      console.error('Add block error:', error)
      setAddingBlockType(type)
    }
  }

  const handleUpdateBlock = async (blockId: string, content: any) => {
    // Store original block for rollback
    const originalBlock = localBlocks.find(b => b.id === blockId)
    if (!originalBlock) return

    // Optimistic update: Update UI immediately
    setLocalBlocks(prev =>
      prev.map(b => b.id === blockId ? { ...b, content } : b)
    )
    setOptimisticUpdates(prev => new Set(prev).add(blockId))
    setSavingBlockId(blockId)

    try {
      const response = await fetch(`/api/posts/${postId}/blocks/${blockId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ content })
      })

      const result = await response.json()

      if (result.success) {
        // Success: Update with server data
        setLocalBlocks(prev =>
          prev.map(b => b.id === blockId ? result.block : b)
        )
        setOptimisticUpdates(prev => {
          const newSet = new Set(prev)
          newSet.delete(blockId)
          return newSet
        })
        // Notify parent with updated blocks
        onBlocksChange(localBlocks.map(b => b.id === blockId ? result.block : b))
      } else {
        // Rollback on error
        setLocalBlocks(prev =>
          prev.map(b => b.id === blockId ? originalBlock : b)
        )
        setOptimisticUpdates(prev => {
          const newSet = new Set(prev)
          newSet.delete(blockId)
          return newSet
        })
        alert('Failed to update block: ' + result.error)
      }
    } catch (error) {
      // Rollback on error
      setLocalBlocks(prev =>
        prev.map(b => b.id === blockId ? originalBlock : b)
      )
      setOptimisticUpdates(prev => {
        const newSet = new Set(prev)
        newSet.delete(blockId)
        return newSet
      })
      alert('Error updating block')
      console.error('Update block error:', error)
    } finally {
      setSavingBlockId(null)
    }
  }

  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm('Are you sure you want to delete this block?')) {
      return
    }

    // Store original blocks for rollback
    const originalBlocks = [...localBlocks]
    const deletedBlock = localBlocks.find(b => b.id === blockId)

    // Optimistic update: Remove block immediately
    setLocalBlocks(prev => prev.filter(b => b.id !== blockId))
    setOptimisticUpdates(prev => new Set(prev).add(blockId))

    try {
      const response = await fetch(`/api/posts/${postId}/blocks/${blockId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()

      if (result.success) {
        // Success: Remove from optimistic updates
        setOptimisticUpdates(prev => {
          const newSet = new Set(prev)
          newSet.delete(blockId)
          return newSet
        })
        // Notify parent with updated blocks
        onBlocksChange(localBlocks.filter(b => b.id !== blockId))
      } else {
        // Rollback on error
        setLocalBlocks(originalBlocks)
        setOptimisticUpdates(prev => {
          const newSet = new Set(prev)
          newSet.delete(blockId)
          return newSet
        })
        alert('Failed to delete block: ' + result.error)
      }
    } catch (error) {
      // Rollback on error
      setLocalBlocks(originalBlocks)
      setOptimisticUpdates(prev => {
        const newSet = new Set(prev)
        newSet.delete(blockId)
        return newSet
      })
      alert('Error deleting block')
      console.error('Delete block error:', error)
    }
  }

  const renderBlock = (block: PostBlock) => {
    const isSaving = savingBlockId === block.id

    switch (block.type) {
      case 'text':
        return (
          <TextBlockEditor
            key={block.id}
            content={block.content as any}
            onSave={(content) => handleUpdateBlock(block.id, content)}
            onDelete={() => handleDeleteBlock(block.id)}
          />
        )
      case 'quote':
        return (
          <QuoteBlockEditor
            key={block.id}
            content={block.content as any}
            onSave={(content) => handleUpdateBlock(block.id, content)}
            onDelete={() => handleDeleteBlock(block.id)}
          />
        )
      case 'image':
        return (
          <ImageBlockEditor
            key={block.id}
            content={block.content as any}
            image={(block as any).image}
            onSave={(content) => handleUpdateBlock(block.id, content)}
            onDelete={() => handleDeleteBlock(block.id)}
            session={session}
          />
        )
      case 'youtube':
        return (
          <YouTubeBlockEditor
            key={block.id}
            content={block.content as any}
            onSave={(content) => handleUpdateBlock(block.id, content)}
            onDelete={() => handleDeleteBlock(block.id)}
          />
        )
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Content Blocks</CardTitle>
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span>{blocks.length}/15 blocks</span>
            <span>•</span>
            <span>{imageBlockCount}/5 images</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Blocks */}
        {localBlocks.map(renderBlock)}

        {/* Add New Block */}
        {addingBlockType ? (
          <div>
            {addingBlockType === 'text' && (
              <TextBlockEditor
                onSave={(content) => handleAddBlock('text', content)}
                onDelete={() => setAddingBlockType(null)}
                onCancel={() => setAddingBlockType(null)}
                isNew
              />
            )}
            {addingBlockType === 'quote' && (
              <QuoteBlockEditor
                onSave={(content) => handleAddBlock('quote', content)}
                onDelete={() => setAddingBlockType(null)}
                onCancel={() => setAddingBlockType(null)}
                isNew
              />
            )}
            {addingBlockType === 'image' && (
              <ImageBlockEditor
                onSave={(content) => handleAddBlock('image', content)}
                onDelete={() => setAddingBlockType(null)}
                onCancel={() => setAddingBlockType(null)}
                isNew
                session={session}
              />
            )}
            {addingBlockType === 'youtube' && (
              <YouTubeBlockEditor
                onSave={(content) => handleAddBlock('youtube', content)}
                onDelete={() => setAddingBlockType(null)}
                onCancel={() => setAddingBlockType(null)}
                isNew
              />
            )}
          </div>
        ) : (
          <div>
            {!canAddBlock && (
              <div className="flex items-center gap-2 text-warning text-sm mb-3">
                <AlertCircle className="w-4 h-4" />
                <span>Maximum 15 blocks reached</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAddingBlockType('text')}
                disabled={!canAddBlock}
                icon={<Type className="w-4 h-4" />}
              >
                Add Text
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAddingBlockType('quote')}
                disabled={!canAddBlock}
                icon={<Quote className="w-4 h-4" />}
              >
                Add Quote
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAddingBlockType('image')}
                disabled={!canAddBlock || !canAddImage}
                icon={<Image className="w-4 h-4" />}
              >
                Add Image {!canAddImage && '(Max 5)'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAddingBlockType('youtube')}
                disabled={!canAddBlock}
                icon={<Youtube className="w-4 h-4" />}
              >
                Add YouTube
              </Button>
            </div>
          </div>
        )}

        {localBlocks.length === 0 && !addingBlockType && (
          <Card className="text-center py-8 bg-dark-surface">
            <CardContent>
              <Plus className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
              <p className="text-text-secondary">No content blocks yet</p>
              <p className="text-text-tertiary text-sm mt-1">Add text, quotes, images, or videos to your post</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}