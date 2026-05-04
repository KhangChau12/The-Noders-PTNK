'use client'

import { useState, useRef, useCallback } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Button } from '@/components/Button'
import {
  Upload,
  X,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface PdfData {
  id: string
  filename: string
  original_name: string
  public_url: string
  file_size: number
}

interface PdfUploadProps {
  value?: PdfData | null
  onChange: (pdfData: PdfData | null) => void
  maxSize?: number // in bytes, default 10MB
  className?: string
  disabled?: boolean
}

export function PdfUpload({
  value,
  onChange,
  maxSize = 10 * 1024 * 1024,
  className = '',
  disabled = false
}: PdfUploadProps) {
  const { session } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
    }
    if (file.type !== 'application/pdf') {
      return 'Please select a valid PDF file'
    }
    return null
  }

  const uploadPdf = async (file: File): Promise<PdfData> => {
    if (!session?.user?.id || !session?.access_token) {
      throw new Error('You must be logged in to upload files')
    }

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload/pdf', {
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
      const pdfData = await uploadPdf(file)
      onChange(pdfData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [onChange, maxSize, session])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const removePdf = () => {
    onChange(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const openFilePicker = () => fileInputRef.current?.click()

  if (value) {
    return (
      <div className={`space-y-3 ${className}`}>
        <label className="block text-sm font-medium text-text-primary">
          Certificate PDF
        </label>

        <div className="flex items-center gap-3 p-4 bg-dark-surface border border-dark-border rounded-lg">
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-error/10 rounded-lg">
            <FileText className="w-5 h-5 text-error" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{value.original_name}</p>
            <p className="text-xs text-text-tertiary">{Math.round(value.file_size / 1024)} KB • PDF</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
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
              onClick={removePdf}
              disabled={disabled}
              className="text-error hover:text-error"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-success">
          <CheckCircle className="w-3.5 h-3.5" />
          PDF uploaded successfully
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
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
        Certificate PDF
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
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={(e) => { e.preventDefault(); setDragOver(false) }}
        onClick={!disabled ? openFilePicker : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 text-primary-blue animate-spin mx-auto" />
            <div>
              <p className="text-text-primary font-medium">Uploading PDF...</p>
              <p className="text-sm text-text-tertiary">Please wait</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <FileText className="w-8 h-8 text-text-tertiary mx-auto" />
            <div>
              <p className="text-text-primary font-medium">Upload Certificate PDF</p>
              <p className="text-sm text-text-tertiary mt-1">PDF format only</p>
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
