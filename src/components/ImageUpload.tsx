'use client'

import { useState, useRef, useCallback } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Button } from '@/components/Button'
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface ImageData {
  id: string
  filename: string
  original_name: string
  public_url: string
  file_size: number
  width?: number
  height?: number
  alt_text?: string
}

interface ImageUploadProps {
  value?: ImageData | null
  onChange: (imageData: ImageData | null) => void
  usage?: 'avatar' | 'project_thumbnail' | 'news_image' | 'general'
  maxSize?: number // in bytes, default 5MB
  className?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

const USAGE_CONFIG = {
  avatar: {
    maxWidth: 400,
    maxHeight: 400,
    label: 'Avatar Image',
    description: 'Square image recommended (400x400px)'
  },
  project_thumbnail: {
    maxWidth: 1200,
    maxHeight: 800,
    label: 'Project Thumbnail',
    description: 'High quality landscape image (1200x800px)'
  },
  news_image: {
    maxWidth: 1600,
    maxHeight: 1200,
    label: 'News Image',
    description: 'High resolution image for articles (1600x1200px)'
  },
  general: {
    maxWidth: 1920,
    maxHeight: 1080,
    label: 'Image',
    description: 'General purpose image'
  }
}

export function ImageUpload({
  value,
  onChange,
  usage = 'general',
  maxSize = 5 * 1024 * 1024, // 5MB default
  className = '',
  placeholder,
  required = false,
  disabled = false
}: ImageUploadProps) {
  const { session } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const config = USAGE_CONFIG[usage]

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, WebP, GIF)'
    }

    return null
  }

  const uploadImage = async (file: File): Promise<ImageData> => {
    if (!session?.user?.id || !session?.access_token) {
      throw new Error('You must be logged in to upload images')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('usage', usage)

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
      throw new Error(errorData.error || 'Upload failed')
    }

    return response.json()
  }

  const handleFileSelect = useCallback(async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setUploading(true)

    try {
      const imageData = await uploadImage(file)
      onChange(imageData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [onChange, usage, maxSize, session])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeImage = () => {
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  if (value) {
    return (
      <div className={`space-y-3 ${className}`}>
        <label className="block text-sm font-medium text-text-primary">
          {config.label}
          {required && <span className="text-error ml-1">*</span>}
        </label>

        <div className="relative group">
          <div className="relative overflow-hidden rounded-lg border border-dark-border">
            <img
              src={value.public_url}
              alt={value.alt_text || value.original_name}
              className="w-full h-40 object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={openFilePicker}
                  disabled={disabled}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Change
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeImage}
                  disabled={disabled}
                  className="text-error hover:text-error"
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>

          <div className="text-xs text-text-tertiary mt-1">
            {value.original_name} • {Math.round(value.file_size / 1024)} KB
            {value.width && value.height && ` • ${value.width}×${value.height}`}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-text-primary">
        {config.label}
        {required && <span className="text-error ml-1">*</span>}
      </label>

      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${dragOver
            ? 'border-primary-blue bg-primary-blue/10'
            : 'border-dark-border hover:border-text-tertiary'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!disabled ? openFilePicker : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 text-primary-blue animate-spin mx-auto" />
            <div>
              <p className="text-text-primary font-medium">Uploading...</p>
              <p className="text-sm text-text-tertiary">Please wait while we process your image</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <ImageIcon className="w-8 h-8 text-text-tertiary mx-auto" />
            <div>
              <p className="text-text-primary font-medium">
                {placeholder || `Upload ${config.label}`}
              </p>
              <p className="text-sm text-text-tertiary mt-1">
                {config.description}
              </p>
              <p className="text-xs text-text-tertiary mt-2">
                Drag & drop or click to browse • Max {Math.round(maxSize / (1024 * 1024))}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-error/20 border border-error/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}
    </div>
  )
}