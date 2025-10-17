'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { useToast } from '@/components/Toast'
import { useConfirm } from '@/components/ConfirmDialog'
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
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const [addingBlockType, setAddingBlockType] = useState<string | null>(null)
  const [savingBlockId, setSavingBlockId] = useState<string | null>(null)
  const [optimisticUpdates, setOptimisticUpdates] = useState<Set<string>>(new Set())

  const imageBlockCount = blocks.filter(b => b.type === 'image').length
  const canAddImage = imageBlockCount < 5
  const canAddBlock = blocks.length < 15

  // Client-side validation (updated for bilingual block content)
  const validateBlock = useCallback((type: string, content: any, order_index?: number) => {
    // Check max blocks
    if (blocks.length >= 15) {
      return { valid: false, error: 'Maximum 15 blocks per post' }
    }

    // Check max images
    if (type === 'image' && imageBlockCount >= 5) {
      return { valid: false, error: 'Maximum 5 image blocks per post' }
    }

    // Check consecutive text blocks
    if (type === 'text' && blocks.length > 0) {
      const lastBlock = blocks[blocks.length - 1]
      if (lastBlock.type === 'text') {
        return { valid: false, error: 'Cannot add consecutive text blocks. Please add a different block type.' }
      }
    }

    // Validate content (bilingual)
    if (type === 'text') {
      // require both languages and numeric word counts
      if (!content || !content.html || !content.html_vi || typeof content.word_count !== 'number' || typeof content.word_count_vi !== 'number') {
        return { valid: false, error: 'Text block requires content in both English and Vietnamese' }
      }
      // enforce per-language word limit (adjust as needed)
      if (content.word_count_en > 800 || content.word_count_vi > 800) {
        return { valid: false, error: 'Text block cannot exceed 800 words per language' }
      }
    }

    if (type === 'quote') {
      // require at least one language
      if (!content || (!content.quote_en && !content.quote_vi)) {
        return { valid: false, error: 'Quote block requires quote text (English or Vietnamese)' }
      }
    }

    if (type === 'image' && (!content || !content.image_id)) {
      return { valid: false, error: 'Image block requires image_id' }
    }

    if (type === 'youtube' && (!content || !content.youtube_url || !content.video_id)) {
      return { valid: false, error: 'YouTube block requires URL and video ID' }
    }

    return { valid: true }
  }, [blocks, imageBlockCount])

  // helper to count words from HTML (used when backend still expects legacy fields)
  const countWordsFromHtml = (html = ''): number => {
    const txt = String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    return txt ? txt.split(' ').filter(Boolean).length : 0
  }

  // prepare content to include legacy single-language fields (html, word_count)
  // while keeping bilingual fields (html_en/html_vi, word_count_en/word_count_vi)
  const prepareContentForServer = (type: string, content: any) => {
    if (!content) return content

    if (type === 'text') {
      const html = content.html ?? ''
      const html_vi = content.html_vi ?? ''
      // pick a fallback html for legacy 'html' field (prefer english)
      const legacyHtml = html || html_vi || ''
      const word_count = typeof content.word_count === 'number' ? content.word_count : countWordsFromHtml(html)
      const word_count_vi = typeof content.word_count_vi === 'number' ? content.word_count_vi : countWordsFromHtml(html_vi)
      const legacyWordCount = typeof content.word_count === 'number'
        ? content.word_count
        : Math.max(word_count, word_count_vi, countWordsFromHtml(legacyHtml))

      return {
        ...content,
        html: legacyHtml,
        word_count: legacyWordCount,
        word_count_en,
        word_count_vi
      }
    }

    // For other block types you can adapt here if server expects legacy fields
    return content
  }

  const handleAddBlock = async (type: string, content: any) => {
    // Client-side validation
    const validation = validateBlock(type, content)
    if (!validation.valid) {
      showToast('error', validation.error)
      return
    }

    // Generate temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`
    const order_index = blocks.length

    const now = new Date().toISOString()

    // Optimistic update: Add block immediately to UI
    const optimisticBlock: PostBlock = {
      id: tempId,
      post_id: postId,
      type: type as any,
      content,
      order_index,
      created_at: now,
      updated_at: now
    }

    // Capture current blocks snapshot to avoid stale closure
    const currentBlocks = [...blocks]
    const optimisticBlocks = [...currentBlocks, optimisticBlock]

    // Update parent immediately with optimistic block
    onBlocksChange(optimisticBlocks)
    setOptimisticUpdates(prev => new Set(prev).add(tempId))
    setAddingBlockType(null) // Close form immediately

    try {
      console.log('Adding block with content:', content);
      const response = await fetch(`/api/posts/${postId}/blocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          type,
          content: prepareContentForServer(type, content),
          order_index
        })
      })

      const result = await response.json()

      if (result.success) {
        // Replace temp block with real block from server using captured snapshot
        const updatedBlocks = optimisticBlocks.map(b => b.id === tempId ? result.block : b)
        onBlocksChange(updatedBlocks)
        setOptimisticUpdates(prev => {
          const newSet = new Set(prev)
          newSet.delete(tempId)
          return newSet
        })
        showToast('success', 'Block added successfully!')
      } else {
        // Rollback on error using captured snapshot
        const rollbackBlocks = optimisticBlocks.filter(b => b.id !== tempId)
        onBlocksChange(rollbackBlocks)
        setOptimisticUpdates(prev => {
          const newSet = new Set(prev)
          newSet.delete(tempId)
          return newSet
        })
        showToast('error', 'Failed to add block: ' + result.error + (content?.html_en ? ' ('+content.html_en.slice(0,50)+')' : ''))
        setAddingBlockType(type) // Re-open form
      }
    } catch (error) {
      // Rollback on error using captured snapshot
      const rollbackBlocks = optimisticBlocks.filter(b => b.id !== tempId)
      onBlocksChange(rollbackBlocks)
      setOptimisticUpdates(prev => {
        const newSet = new Set(prev)
        newSet.delete(tempId)
        return newSet
      })
      showToast('error', 'Error adding block. Please try again.')
      console.error('Add block error:', error)
      setAddingBlockType(type)
    }
  }

  const handleUpdateBlock = async (blockId: string, content: any) => {
    // Capture current blocks snapshot to avoid stale closure
    const currentBlocks = [...blocks]

    // Store original block for rollback
    const originalBlock = currentBlocks.find(b => b.id === blockId)
    if (!originalBlock) return

    // Optimistic update: Update UI immediately
    const optimisticBlocks = currentBlocks.map(b => b.id === blockId ? { ...b, content, updated_at: new Date().toISOString() } : b)
    onBlocksChange(optimisticBlocks)
    setOptimisticUpdates(prev => new Set(prev).add(blockId))
    setSavingBlockId(blockId)

    try {
      const response = await fetch(`/api/posts/${postId}/blocks/${blockId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ content: prepareContentForServer(originalBlock.type, content) })
      })

      const result = await response.json()

      if (result.success) {
        // Success: Update with server data using captured snapshot
        const updatedBlocks = optimisticBlocks.map(b => b.id === blockId ? result.block : b)
        onBlocksChange(updatedBlocks)
        setOptimisticUpdates(prev => {
          const newSet = new Set(prev)
          newSet.delete(blockId)
          return newSet
        })
        showToast('success', 'Block updated successfully!')
      } else {
        // Rollback on error using captured snapshot
        const rollbackBlocks = optimisticBlocks.map(b => b.id === blockId ? originalBlock : b)
        onBlocksChange(rollbackBlocks)
        setOptimisticUpdates(prev => {
          const newSet = new Set(prev)
          newSet.delete(blockId)
          return newSet
        })
        showToast('error', 'Failed to update block: ' + result.error)
      }
    } catch (error) {
      // Rollback on error using captured snapshot
      const rollbackBlocks = optimisticBlocks.map(b => b.id === blockId ? originalBlock : b)
      onBlocksChange(rollbackBlocks)
      setOptimisticUpdates(prev => {
        const newSet = new Set(prev)
        newSet.delete(blockId)
        return newSet
      })
      showToast('error', 'Error updating block. Please try again.')
      console.error('Update block error:', error)
    } finally {
      setSavingBlockId(null)
    }
  }

  const handleDeleteBlock = async (blockId: string) => {
    const confirmed = await confirm({
      title: 'Delete Block',
      message: 'Are you sure you want to delete this block? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    })

    if (!confirmed) {
      return
    }

    // Capture current blocks snapshot to avoid stale closure
    const currentBlocks = [...blocks]

    // Store original blocks for rollback
    const originalBlocks = currentBlocks

    // Optimistic update: Remove block immediately
    const optimisticBlocks = currentBlocks.filter(b => b.id !== blockId)
    onBlocksChange(optimisticBlocks)
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
        // Success: Confirm deletion (already filtered in optimisticBlocks)
        onBlocksChange(optimisticBlocks)
        setOptimisticUpdates(prev => {
          const newSet = new Set(prev)
          newSet.delete(blockId)
          return newSet
        })
        showToast('success', 'Block deleted successfully!')
      } else {
        // Rollback on error
        onBlocksChange(originalBlocks)
        setOptimisticUpdates(prev => {
          const newSet = new Set(prev)
          newSet.delete(blockId)
          return newSet
        })
        showToast('error', 'Failed to delete block: ' + result.error)
      }
    } catch (error) {
      // Rollback on error
      onBlocksChange(originalBlocks)
      setOptimisticUpdates(prev => {
        const newSet = new Set(prev)
        newSet.delete(blockId)
        return newSet
      })
      showToast('error', 'Error deleting block. Please try again.')
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
        {blocks.map(renderBlock)}

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

        {blocks.length === 0 && !addingBlockType && (
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