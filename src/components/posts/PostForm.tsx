'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Badge } from '@/components/Badge'
import { POST_CATEGORIES } from '@/lib/constants'
import { Post } from '@/types/database'
import { X, Upload, Image as ImageIcon } from 'lucide-react'

interface PostFormProps {
  post?: Post | null
  onSave: (data: {
    title: string
    summary: string
    category: string
    thumbnail_image_id?: string
  }) => Promise<void>
  saving?: boolean
  session: any
}

export function PostForm({ post, onSave, saving, session }: PostFormProps) {
  const [title, setTitle] = useState(post?.title || '')
  const [summary, setSummary] = useState(post?.summary || '')
  const [category, setCategory] = useState<string>(post?.category || POST_CATEGORIES[0])
  const [thumbnailImageId, setThumbnailImageId] = useState<string | undefined>(
    post?.thumbnail_image_id || undefined
  )
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const titleLength = title.length
  const summaryLength = summary.length
  const titleValid = titleLength <= 100
  const summaryValid = summaryLength <= 300

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('usage', 'project_thumbnail')
      formData.append('alt_text', `Thumbnail for ${title || 'post'}`)

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
      setThumbnailImageId(imageData.id)
      setThumbnailUrl(imageData.public_url)
    } catch (error) {
      alert('Error uploading image')
      console.error('Upload error:', error)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!titleValid || !summaryValid) {
      alert('Please fix validation errors')
      return
    }

    await onSave({
      title,
      summary,
      category,
      thumbnail_image_id: thumbnailImageId
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              maxLength={100}
            />
            <div className="flex justify-between mt-1">
              <p className={`text-xs ${titleValid ? 'text-text-tertiary' : 'text-error'}`}>
                {titleLength}/100 characters
              </p>
              {!titleValid && (
                <p className="text-xs text-error">Max 100 characters</p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Summary (2-3 sentences)
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Write a brief summary..."
              maxLength={300}
              rows={3}
              className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none"
            />
            <div className="flex justify-between mt-1">
              <p className={`text-xs ${summaryValid ? 'text-text-tertiary' : 'text-error'}`}>
                {summaryLength}/300 characters
              </p>
              {!summaryValid && (
                <p className="text-xs text-error">Max 300 characters</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {POST_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    category === cat
                      ? 'border-primary-blue bg-primary-blue/10 text-primary-blue'
                      : 'border-dark-border text-text-secondary hover:border-dark-border/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Thumbnail Image
            </label>

            {thumbnailUrl ? (
              <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden">
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setThumbnailImageId(undefined)
                    setThumbnailUrl(null)
                  }}
                  className="absolute top-2 right-2 p-2 bg-dark-bg/80 rounded-lg hover:bg-dark-bg transition-colors"
                >
                  <X className="w-4 h-4 text-text-primary" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full max-w-md h-32 border-2 border-dashed border-dark-border rounded-lg cursor-pointer hover:border-primary-blue transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploadingImage ? (
                    <>
                      <div className="w-8 h-8 border-2 border-primary-blue/30 border-t-primary-blue rounded-full animate-spin mb-2" />
                      <p className="text-sm text-text-tertiary">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-text-tertiary mb-2" />
                      <p className="text-sm text-text-secondary">Click to upload thumbnail</p>
                      <p className="text-xs text-text-tertiary">PNG, JPG up to 10MB</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-border">
            <Button
              type="submit"
              disabled={!titleValid || !summaryValid || saving}
            >
              {saving ? 'Saving...' : 'Save Information'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}