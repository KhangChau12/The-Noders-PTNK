'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
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
  const [text, setText] = useState(content?.html || '')
  const wordCount = countWords(text.replace(/<[^>]*>/g, ''))
  const isValid = wordCount > 0 && wordCount <= 800

  const handleSave = () => {
    if (!isValid) {
      alert('Text must be between 1 and 800 words')
      return
    }

    // Simple HTML conversion (for demo - in production use a proper rich text editor)
    const html = text
      .split('\n\n')
      .map(para => para.trim())
      .filter(para => para.length > 0)
      .map(para => `<p>${para}</p>`)
      .join('\n')

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

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your content here... (Plain text will be converted to paragraphs)"
          rows={8}
          className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none"
        />

        <div className="flex items-center justify-between mt-3">
          <p className={`text-sm ${isValid ? 'text-text-tertiary' : 'text-error'}`}>
            {wordCount}/800 words
            {wordCount > 800 && ' - Exceeds maximum'}
          </p>

          {isNew && (
            <Button size="sm" onClick={handleSave} disabled={!isValid}>
              <Check className="w-4 h-4 mr-1" />
              Add Block
            </Button>
          )}
        </div>

        {!isNew && wordCount !== content?.word_count && (
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