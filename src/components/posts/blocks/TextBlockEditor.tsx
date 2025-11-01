'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { RichTextEditor } from '@/components/RichTextEditor'
import { LanguageTabs, LanguageTabPanel, Language, ValidationStatus } from '@/components/LanguageTabs'
import { Type, Trash2, GripVertical, Check, X } from 'lucide-react'

interface TextBlockEditorProps {
  content?: { html: string; html_vi: string; word_count: number; word_count_vi: number }
  onSave: (content: { html: string; html_vi: string; word_count: number; word_count_vi: number }) => void
  onDelete: () => void
  onCancel?: () => void
  isNew?: boolean
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

export function TextBlockEditor({ content, onSave, onDelete, onCancel, isNew }: TextBlockEditorProps) {
  const [html, setHtml] = useState(content?.html || '')
  const [html_vi, setHtmlVi] = useState(content?.html_vi || '')
  const [language, setLanguage] = useState<Language>('en')

  const wordCount = countWords(html.replace(/<[^>]*>/g, ''))
  const wordCountVi = countWords(html_vi.replace(/<[^>]*>/g, ''))
  const isValid = (wordCount > 0 && wordCount <= 200) || (wordCountVi > 0 && wordCountVi <= 200)
  const hasChanges = html !== (content?.html || '') || html_vi !== (content?.html_vi || '')

  // Validation status for tabs
  const getStatus = (lang: Language): ValidationStatus => {
    const count = lang === 'en' ? wordCount : wordCountVi
    if (count > 200) return 'error'
    if (count === 0) return 'empty'
    return 'valid'
  }

  const handleSave = () => {
    if (!isValid) {
      alert('Text must be between 1 and 200 words')
      return
    }

    onSave({ html, html_vi, word_count: wordCount, word_count_vi: wordCountVi })
  }

  return (
    <Card className="border-primary-blue/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
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

        <LanguageTabs
          activeLanguage={language}
          onLanguageChange={setLanguage}
          enStatus={getStatus('en')}
          viStatus={getStatus('vi')}
        />

        <LanguageTabPanel language="en" activeLanguage={language}>
          <RichTextEditor
            value={html}
            onChange={setHtml}
            placeholder="Write your content in English... Use the toolbar to format text with bold, italic, headers, colors and more."
          />
          <p className={`text-sm mt-3 ${wordCount > 200 ? 'text-error' : 'text-text-tertiary'}`}>
            {wordCount}/200 words
            {wordCount > 200 && ' - Exceeds maximum'}
          </p>
        </LanguageTabPanel>

        <LanguageTabPanel language="vi" activeLanguage={language}>
          <RichTextEditor
            value={html_vi}
            onChange={setHtmlVi}
            placeholder="Viết nội dung bằng tiếng Việt... Sử dụng thanh công cụ để định dạng văn bản với in đậm, in nghiêng, tiêu đề, màu sắc và hơn thế nữa."
          />
          <p className={`text-sm mt-3 ${wordCountVi > 200 ? 'text-error' : 'text-text-tertiary'}`}>
            {wordCountVi}/200 từ
            {wordCountVi > 200 && ' - Vượt quá giới hạn'}
          </p>
        </LanguageTabPanel>

        <div className="flex items-center justify-end gap-2 mt-4">
          {isNew && (
            <Button size="sm" onClick={handleSave} disabled={!isValid}>
              <Check className="w-4 h-4 mr-1" />
              Add Block
            </Button>
          )}

          {!isNew && hasChanges && (
            <Button size="sm" onClick={handleSave} disabled={!isValid}>
              Save Changes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}