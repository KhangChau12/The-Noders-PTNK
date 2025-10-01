'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Image as ImageIcon, Trash2, GripVertical, Check, X, Upload } from 'lucide-react'

interface ImageBlockEditorProps {
  content?: { image_id: string; caption?: string; alt_text?: string }
  onSave: (content: { image_id: string; caption?: string; alt_text?: string }) => void
  onDelete: () => void
  onCancel?: () => void
  isNew?: boolean
  session: any
}

export function ImageBlockEditor({ content, onSave, onDelete, onCancel, isNew, session }: ImageBlockEditorProps) {
  const [imageId, setImageId] = useState(content?.image_id || '')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState(content?.caption || '')
  const [altText, setAltText] = useState(content?.alt_text || '')
  const [uploading, setUploading] = useState(false)

  const isValid = imageId.length > 0

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('usage', 'news_image')
      formData.append('alt_text', altText || 'Post image')

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
        alert('Failed to upload image: ' + (errorData.error || 'Unknown error'))
        return
      }

      const imageData = await response.json()
      setImageId(imageData.id)
      setImageUrl(imageData.public_url)
      if (!altText) setAltText(imageData.filename)
    } catch (error) {
      alert('Error uploading image')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = () => {
    if (!isValid) {
      alert('Image is required')
      return
    }

    onSave({
      image_id: imageId,
      caption: caption.trim() || undefined,
      alt_text: altText.trim() || undefined
    })
  }

  return (
    <Card className="border-accent-cyan/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-text-tertiary cursor-move" />
            <ImageIcon className="w-4 h-4 text-accent-cyan" />
            <span className="text-sm font-medium text-text-primary">Image Block</span>
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
          {/* Image Upload */}
          {imageUrl ? (
            <div className="relative aspect-video w-full rounded-lg overflow-hidden">
              <img
                src={imageUrl}
                alt={altText || 'Uploaded image'}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImageId('')
                  setImageUrl(null)
                }}
                className="absolute top-2 right-2 p-2 bg-dark-bg/80 rounded-lg hover:bg-dark-bg transition-colors"
              >
                <X className="w-4 h-4 text-text-primary" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-dark-border rounded-lg cursor-pointer hover:border-accent-cyan transition-colors">
              <div className="flex flex-col items-center justify-center">
                {uploading ? (
                  <>
                    <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin mb-2" />
                    <p className="text-sm text-text-tertiary">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-text-tertiary mb-2" />
                    <p className="text-sm text-text-secondary">Click to upload image</p>
                    <p className="text-xs text-text-tertiary">PNG, JPG up to 10MB</p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          )}

          {/* Alt Text */}
          <div>
            <label className="block text-xs text-text-tertiary mb-1">Alt Text (for accessibility)</label>
            <Input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image..."
              maxLength={200}
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs text-text-tertiary mb-1">Caption (optional)</label>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              maxLength={200}
            />
          </div>
        </div>

        {isNew && (
          <div className="flex justify-end mt-4">
            <Button size="sm" onClick={handleSave} disabled={!isValid || uploading}>
              <Check className="w-4 h-4 mr-1" />
              Add Block
            </Button>
          </div>
        )}

        {!isNew && (imageId !== content?.image_id || caption !== content?.caption || altText !== content?.alt_text) && (
          <div className="flex justify-end mt-4">
            <Button size="sm" onClick={handleSave} disabled={!isValid || uploading}>
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}