'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Youtube, Trash2, GripVertical, Check, X } from 'lucide-react'

interface YouTubeBlockEditorProps {
  content?: { youtube_url: string; video_id: string; title?: string }
  onSave: (content: { youtube_url: string; video_id: string; title?: string }) => void
  onDelete: () => void
  onCancel?: () => void
  isNew?: boolean
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtu\.be\/([^?]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

export function YouTubeBlockEditor({ content, onSave, onDelete, onCancel, isNew }: YouTubeBlockEditorProps) {
  const [url, setUrl] = useState(content?.youtube_url || '')
  const [title, setTitle] = useState(content?.title || '')
  const [videoId, setVideoId] = useState(content?.video_id || '')
  const [urlError, setUrlError] = useState<string | null>(null)

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl)
    setUrlError(null)

    if (newUrl.trim()) {
      const id = extractVideoId(newUrl)
      if (id) {
        setVideoId(id)
      } else {
        setUrlError('Invalid YouTube URL')
        setVideoId('')
      }
    } else {
      setVideoId('')
    }
  }

  const isValid = videoId.length > 0 && url.length > 0

  const handleSave = () => {
    if (!isValid) {
      alert('Valid YouTube URL is required')
      return
    }

    onSave({
      youtube_url: url,
      video_id: videoId,
      title: title.trim() || undefined
    })
  }

  return (
    <Card className="border-error/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-text-tertiary cursor-move" />
            <Youtube className="w-4 h-4 text-error" />
            <span className="text-sm font-medium text-text-primary">YouTube Block</span>
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
          {/* YouTube URL */}
          <div>
            <label className="block text-xs text-text-tertiary mb-1">YouTube URL *</label>
            <Input
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {urlError && (
              <p className="text-xs text-error mt-1">{urlError}</p>
            )}
            {videoId && !urlError && (
              <p className="text-xs text-success mt-1">✓ Valid YouTube video detected</p>
            )}
          </div>

          {/* Preview */}
          {videoId && (
            <div className="aspect-video relative overflow-hidden rounded-lg bg-dark-surface">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs text-text-tertiary mb-1">Title (optional)</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title or description..."
              maxLength={200}
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

        {!isNew && (url !== content?.youtube_url || title !== content?.title) && (
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