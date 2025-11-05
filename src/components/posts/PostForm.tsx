'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Badge } from '@/components/Badge'
import { LanguageTabs, LanguageTabPanel, Language, ValidationStatus } from '@/components/LanguageTabs'
import { POST_CATEGORIES } from '@/lib/constants'
import { Post } from '@/types/database'
import { X, Upload, Image as ImageIcon } from 'lucide-react'

// Display name mapping for categories
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'News': 'News',
  'You may want to know': 'Do You Know?',
  'Member Spotlight': 'Member Spotlight',
  'Community Activities': 'Community Activities',
}

interface PostFormProps {
  post?: Post | null
  onSave: (data: {
    title: string
    title_vi: string
    summary: string
    summary_vi: string
    category: string
    thumbnail_image_id?: string
  }) => Promise<void>
  saving?: boolean
  session: any
}

export function PostForm({ post, onSave, saving, session }: PostFormProps) {
  const [title, setTitle] = useState(post?.title || '')
  const [title_vi, setTitleVi] = useState(post?.title_vi || '')
  const [summary, setSummary] = useState(post?.summary || '')
  const [summary_vi, setSummaryVi] = useState(post?.summary_vi || '')
  const [category, setCategory] = useState<string>(post?.category || POST_CATEGORIES[0])
  const [thumbnailImageId, setThumbnailImageId] = useState<string | undefined>(
    post?.thumbnail_image_id || undefined
  )
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Language tab states
  const [titleLanguage, setTitleLanguage] = useState<Language>('en')
  const [summaryLanguage, setSummaryLanguage] = useState<Language>('en')

  // Load existing thumbnail on mount
  useEffect(() => {
    if (post) {
      const existingUrl = (post as any).thumbnail_image?.public_url || (post as any).thumbnail_url
      if (existingUrl) {
        setThumbnailUrl(existingUrl)
      }
    }
  }, [post])

  const titleLength = title.length
  const titleViLength = title_vi.length
  const summaryLength = summary.length
  const summaryViLength = summary_vi.length
  const titleValid = titleLength <= 100 && titleViLength <= 100
  const summaryValid = summaryLength <= 500 && summaryViLength <= 500

  // Validation status for tabs
  const getTitleStatus = (lang: Language): ValidationStatus => {
    const len = lang === 'en' ? titleLength : titleViLength
    if (len > 100) return 'error'
    if (len === 0) return 'empty'
    return 'valid'
  }

  const getSummaryStatus = (lang: Language): ValidationStatus => {
    const len = lang === 'en' ? summaryLength : summaryViLength
    if (len > 500) return 'error'
    if (len === 0) return 'empty'
    return 'valid'
  }

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
      title_vi,
      summary,
      summary_vi,
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
            <label className="block text-sm font-medium text-text-secondary mb-3">
              Title
            </label>
            <LanguageTabs
              activeLanguage={titleLanguage}
              onLanguageChange={setTitleLanguage}
              enStatus={getTitleStatus('en')}
              viStatus={getTitleStatus('vi')}
            />
            <LanguageTabPanel language="en" activeLanguage={titleLanguage}>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title in English..."
                maxLength={100}
              />
              <p className={`text-xs mt-2 ${titleLength > 100 ? 'text-error' : 'text-text-tertiary'}`}>
                {titleLength}/100 characters
                {titleLength > 100 && ' - Exceeds maximum'}
              </p>
            </LanguageTabPanel>
            <LanguageTabPanel language="vi" activeLanguage={titleLanguage}>
              <Input
                value={title_vi}
                onChange={(e) => setTitleVi(e.target.value)}
                placeholder="Nhập tiêu đề bài viết bằng tiếng Việt..."
                maxLength={100}
              />
              <p className={`text-xs mt-2 ${titleViLength > 100 ? 'text-error' : 'text-text-tertiary'}`}>
                {titleViLength}/100 ký tự
                {titleViLength > 100 && ' - Vượt quá giới hạn'}
              </p>
            </LanguageTabPanel>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-3">
              Summary (2-3 sentences)
            </label>
            <LanguageTabs
              activeLanguage={summaryLanguage}
              onLanguageChange={setSummaryLanguage}
              enStatus={getSummaryStatus('en')}
              viStatus={getSummaryStatus('vi')}
            />
            <LanguageTabPanel language="en" activeLanguage={summaryLanguage}>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Write a brief summary in English (2-3 sentences)..."
                maxLength={500}
                rows={4}
                className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none"
              />
              <p className={`text-xs mt-2 ${summaryLength > 500 ? 'text-error' : 'text-text-tertiary'}`}>
                {summaryLength}/500 characters
                {summaryLength > 500 && ' - Exceeds maximum'}
              </p>
            </LanguageTabPanel>
            <LanguageTabPanel language="vi" activeLanguage={summaryLanguage}>
              <textarea
                value={summary_vi}
                onChange={(e) => setSummaryVi(e.target.value)}
                placeholder="Viết tóm tắt ngắn gọn bằng tiếng Việt (2-3 câu)..."
                maxLength={500}
                rows={4}
                className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none"
              />
              <p className={`text-xs mt-2 ${summaryViLength > 500 ? 'text-error' : 'text-text-tertiary'}`}>
                {summaryViLength}/500 ký tự
                {summaryViLength > 500 && ' - Vượt quá giới hạn'}
              </p>
            </LanguageTabPanel>
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
                  {CATEGORY_DISPLAY_NAMES[cat] || cat}
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