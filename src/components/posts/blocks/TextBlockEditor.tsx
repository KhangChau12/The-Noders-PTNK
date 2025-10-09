'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { RichTextEditor } from '@/components/RichTextEditor'
import { Type, Trash2, GripVertical, Check, X } from 'lucide-react'

interface TextBlockEditorProps {
  content?: { html: string; word_count: number }
  onSave: (content: { html: string; word_count: number }) => void
  onDelete: () => void
  onCancel?: () => void
  isNew?: boolean
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

export function TextBlockEditor({ content, onSave, onDelete, onCancel, isNew }: TextBlockEditorProps) {
  const [html, setHtml] = useState(content?.html || '')
  const wordCount = countWords(html.replace(/<[^>]*>/g, ''))
  const isValid = wordCount > 0 && wordCount <= 200
  const hasChanges = html !== (content?.html || '')

  const handleSave = () => {
    if (!isValid) {
      alert('Text must be between 1 and 200 words')
      return
    }

    onSave({ html, word_count: wordCount })
  }

  return (
    <Card className="border-primary-blue/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-text-tertiary cursor-move" />
            <Type className="w-4 h-4 text-primary-blue" />
            <span className="text-sm font-medium text-text-primary">Text Block</span>
          </div>
          <div className="flex items-center gap-2">
            {isNew && onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-error">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <RichTextEditor
          value={html}
          onChange={setHtml}
          placeholder="Write your content here... Use the toolbar to format text with bold, italic, headers, colors and more."
        />

        <div className="flex items-center justify-between mt-3">
          <p className={`text-sm ${isValid ? 'text-text-tertiary' : 'text-error'}`}>
            {wordCount}/200 words
            {wordCount > 200 && ' - Exceeds maximum'}
          </p>

          {isNew && (
            <Button size="sm" onClick={handleSave} disabled={!isValid}>
              <Check className="w-4 h-4 mr-1" />
              Add Block
            </Button>
          )}
        </div>

        {!isNew && hasChanges && (
          <div className="mt-2">
            <Button size="sm" onClick={handleSave} disabled={!isValid}>
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}