'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Quote, Trash2, GripVertical, Check, X } from 'lucide-react'

interface QuoteBlockEditorProps {
  content?: { quote: string; author?: string; source?: string }
  onSave: (content: { quote: string; author?: string; source?: string }) => void
  onDelete: () => void
  onCancel?: () => void
  isNew?: boolean
}

export function QuoteBlockEditor({ content, onSave, onDelete, onCancel, isNew }: QuoteBlockEditorProps) {
  const [quote, setQuote] = useState(content?.quote || '')
  const [author, setAuthor] = useState(content?.author || '')
  const [source, setSource] = useState(content?.source || '')

  const isValid = quote.trim().length > 0 && quote.length <= 500

  const handleSave = () => {
    if (!isValid) {
      alert('Quote is required and must be 500 characters or less')
      return
    }

    onSave({
      quote: quote.trim(),
      author: author.trim() || undefined,
      source: source.trim() || undefined
    })
  }

  return (
    <Card className="border-accent-purple/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-text-tertiary cursor-move" />
            <Quote className="w-4 h-4 text-accent-purple" />
            <span className="text-sm font-medium text-text-primary">Quote Block</span>
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

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-text-tertiary mb-1">Quote *</label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Enter the quote..."
              maxLength={500}
              rows={4}
              className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-purple focus:border-transparent resize-none text-sm"
            />
            <p className={`text-xs mt-1 ${isValid ? 'text-text-tertiary' : 'text-error'}`}>
              {quote.length}/500 characters
            </p>
          </div>

          <div>
            <label className="block text-xs text-text-tertiary mb-1">Author (optional)</label>
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g., Albert Einstein"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-xs text-text-tertiary mb-1">Source (optional)</label>
            <Input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g., The Theory of Relativity"
              maxLength={100}
            />
          </div>
        </div>

        {isNew && (
          <div className="flex justify-end mt-4">
            <Button size="sm" onClick={handleSave} disabled={!isValid}>
              <Check className="w-4 h-4 mr-1" />
              Add Block
            </Button>
          </div>
        )}

        {!isNew && (quote !== content?.quote || author !== content?.author || source !== content?.source) && (
          <div className="flex justify-end mt-4">
            <Button size="sm" onClick={handleSave} disabled={!isValid}>
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}