'use client'

import { useState } from 'react'
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
  onBlocksChange: () => void
  session: any
}

export function BlockEditor({ blocks, postId, onBlocksChange, session }: BlockEditorProps) {
  const [addingBlockType, setAddingBlockType] = useState<string | null>(null)
  const [savingBlockId, setSavingBlockId] = useState<string | null>(null)

  const imageBlockCount = blocks.filter(b => b.type === 'image').length
  const canAddImage = imageBlockCount < 5
  const canAddBlock = blocks.length < 15

  const handleAddBlock = async (type: string, content: any) => {
    if (!canAddBlock) {
      alert('Maximum 15 blocks per post')
      return
    }

    if (type === 'image' && !canAddImage) {
      alert('Maximum 5 image blocks per post')
      return
    }

    // Check consecutive text blocks
    if (type === 'text' && blocks.length > 0) {
      const lastBlock = blocks[blocks.length - 1]
      if (lastBlock.type === 'text') {
        alert('Cannot add consecutive text blocks. Please add a different block type.')
        return
      }
    }

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
          order_index: blocks.length
        })
      })

      const result = await response.json()

      if (result.success) {
        setAddingBlockType(null)
        onBlocksChange()
      } else {
        alert('Failed to add block: ' + result.error)
      }
    } catch (error) {
      alert('Error adding block')
      console.error('Add block error:', error)
    }
  }

  const handleUpdateBlock = async (blockId: string, content: any) => {
    try {
      setSavingBlockId(blockId)

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
        onBlocksChange()
      } else {
        alert('Failed to update block: ' + result.error)
      }
    } catch (error) {
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

    try {
      const response = await fetch(`/api/posts/${postId}/blocks/${blockId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()

      if (result.success) {
        onBlocksChange()
      } else {
        alert('Failed to delete block: ' + result.error)
      }
    } catch (error) {
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