'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { RichTextEditor } from '@/components/RichTextEditor'
import { Type, Trash2, GripVertical, Check, X } from 'lucide-react'

interface TextBlockEditorProps {
  content?: { html_en: string; html_vi: string; word_count_en: number; word_count_vi: number }
  onSave: (content: { html_en: string; html_vi: string; word_count_en: number; word_count_vi: number }) => void
  onDelete: () => void
  onCancel?: () => void
  isNew?: boolean
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

export function TextBlockEditor({ content, onSave, onDelete, onCancel, isNew }: TextBlockEditorProps) {
  const [html_en, setHtmlEn] = useState(content?.html_en || '')
  const [html_vi, setHtmlVi] = useState(content?.html_vi || '')
  const wordCountEn = countWords(html_en.replace(/<[^>]*>/g, ''))
  const wordCountVi = countWords(html_vi.replace(/<[^>]*>/g, ''))
  const isValid = (wordCountEn > 0 && wordCountEn <= 200) || (wordCountVi > 0 && wordCountVi <= 200)
  const hasChanges = html_en !== (content?.html_en || '') || html_vi !== (content?.html_vi || '')

  const handleSave = () => {
    if (!isValid) {
      alert('Text must be between 1 and 200 words')
      return
    }

    onSave({ html_en, html_vi, word_count_en: wordCountEn, word_count_vi: wordCountVi })
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
          value={html_en}
          onChange={setHtmlEn}
          placeholder="Write your content here... Use the toolbar to format text with bold, italic, headers, colors and more."
        />

        <RichTextEditor
          value={html_vi}
          onChange={setHtmlVi}
          placeholder="Write your content here... Use the toolbar to format text with bold, italic, headers, colors and more."
        />

        <div className="flex items-center justify-between mt-3">
          <p className={`text-sm ${isValid ? 'text-text-tertiary' : 'text-error'}`}>
            {wordCountEn}/200 words
            {wordCountEn > 200 && ' - Exceeds maximum'}
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