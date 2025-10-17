'use client'

import { useRef, useEffect, useState } from 'react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Type,
  Link as LinkIcon
} from 'lucide-react'
import { Button } from '@/components/Button'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder = "Enter project details...", className = "" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isEditorFocused, setIsEditorFocused] = useState(false)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''

      // Ensure all existing links open in new tab
      const links = editorRef.current.querySelectorAll('a[href]')
      links.forEach((link: any) => {
        link.setAttribute('target', '_blank')
        link.setAttribute('rel', 'noopener noreferrer')
      })
    }
  }, [value])

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
    editorRef.current?.focus()
  }

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const insertText = (text: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
      document.execCommand('insertHTML', false, text)
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleCreateLink = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      alert('Please select text to create a link')
      return
    }

    const selectedText = selection.toString()
    if (!selectedText) {
      alert('Please select text to create a link')
      return
    }

    const url = prompt('Enter URL:', 'https://')
    if (!url) return

    // Validate URL
    try {
      new URL(url)
    } catch {
      alert('Please enter a valid URL')
      return
    }

    executeCommand('createLink', url)

    // Set target="_blank" and rel for security on newly created links
    setTimeout(() => {
      if (editorRef.current) {
        const links = editorRef.current.querySelectorAll('a[href]')
        links.forEach((link: any) => {
          if (!link.hasAttribute('target')) {
            link.setAttribute('target', '_blank')
            link.setAttribute('rel', 'noopener noreferrer')
          }
        })
        onChange(editorRef.current.innerHTML)
      }
    }, 10)
  }

  const formatButtons = [
    { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
    { icon: Underline, command: 'underline', title: 'Underline (Ctrl+U)' },
    { icon: Strikethrough, command: 'strikethrough', title: 'Strikethrough' },
  ]

  const headingButtons = [
    { icon: Heading1, command: 'formatBlock', value: '<h1>', title: 'Heading 1' },
    { icon: Heading2, command: 'formatBlock', value: '<h2>', title: 'Heading 2' },
    { icon: Heading3, command: 'formatBlock', value: '<h3>', title: 'Heading 3' },
    { icon: Type, command: 'formatBlock', value: '<p>', title: 'Paragraph' },
  ]

  const listButtons = [
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { icon: Quote, command: 'formatBlock', value: '<blockquote>', title: 'Quote' },
  ]

  const actionButtons = [
    { icon: Undo, command: 'undo', title: 'Undo (Ctrl+Z)' },
    { icon: Redo, command: 'redo', title: 'Redo (Ctrl+Y)' },
  ]

  const colorButtons = [
    { color: '#F8FAFC', title: 'Primary Text', name: 'Primary' },
    { color: '#CBD5E1', title: 'Secondary Text', name: 'Secondary' },
    { color: '#2563EB', title: 'Primary Blue', name: 'Blue' },
    { color: '#10B981', title: 'Accent Green', name: 'Green' },
    { color: '#06B6D4', title: 'Accent Cyan', name: 'Cyan' },
    { color: '#DC2626', title: 'Error Red', name: 'Red' },
    { color: '#D97706', title: 'Warning Orange', name: 'Orange' },
    { color: '#7C3AED', title: 'Purple Accent', name: 'Purple' },
  ]

  return (
    <div className={`border mb-3 border-dark-border rounded-xl bg-dark-surface shadow-lg ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-dark-border p-4 flex flex-wrap gap-3 bg-gradient-to-r from-dark-surface to-dark-surface/80 rounded-t-xl">
        {/* Format buttons */}
        <div className="flex gap-1.5 mr-3">
          {formatButtons.map((btn) => (
            <Button
              key={btn.command}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => executeCommand(btn.command)}
              title={btn.title}
              className="p-2 h-8 w-8"
            >
              <btn.icon className="w-4 h-4" />
            </Button>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCreateLink}
            title="Insert Link (Select text first)"
            className="p-2 h-8 w-8"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-dark-border mx-2" />

        {/* Heading buttons */}
        <div className="flex gap-1.5 mr-3">
          {headingButtons.map((btn) => (
            <Button
              key={btn.command + btn.value}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => executeCommand(btn.command, btn.value)}
              title={btn.title}
              className="p-2 h-8 w-8"
            >
              <btn.icon className="w-4 h-4" />
            </Button>
          ))}
        </div>

        <div className="w-px h-6 bg-dark-border mx-2" />

        {/* List buttons */}
        <div className="flex gap-1.5 mr-3">
          {listButtons.map((btn) => (
            <Button
              key={btn.command}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => executeCommand(btn.command, btn.value)}
              title={btn.title}
              className="p-2 h-8 w-8"
            >
              <btn.icon className="w-4 h-4" />
            </Button>
          ))}
        </div>

        <div className="w-px h-6 bg-dark-border mx-2" />

        {/* Color buttons */}
        <div className="flex gap-1.5 mr-3">
          {colorButtons.map((color) => (
            <button
              key={color.color}
              type="button"
              onClick={() => executeCommand('foreColor', color.color)}
              title={color.title}
              className="group relative w-7 h-7 rounded-md border border-dark-border hover:border-primary-blue/50 transition-all duration-200 hover:scale-105 overflow-hidden"
              style={{ backgroundColor: color.color }}
            >
              {/* Subtle overlay for better visibility */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent group-hover:from-white/20" />

              {/* Tooltip */}
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-dark-bg text-text-primary text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                {color.name}
              </span>
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-dark-border mx-2" />

        {/* Action buttons */}
        <div className="flex gap-1.5">
          {actionButtons.map((btn) => (
            <Button
              key={btn.command}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => executeCommand(btn.command)}
              title={btn.title}
              className="p-2 h-8 w-8"
            >
              <btn.icon className="w-4 h-4" />
            </Button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={() => setIsEditorFocused(true)}
          onBlur={() => setIsEditorFocused(false)}
          className={`min-h-[100px] p-6 text-text-primary focus:outline-none rounded-b-xl prose prose-invert max-w-none ${
            isEditorFocused ? 'bg-dark-surface/50' : 'bg-transparent'
          } transition-all duration-200`}
          style={{ wordBreak: 'break-word' }}
          suppressContentEditableWarning={true}
        />

        {/* Placeholder */}
        {(!value || value === '') && !isEditorFocused && (
          <div className="absolute top-6 left-6 text-text-tertiary pointer-events-none flex items-start gap-2 max-w-[calc(100%-3rem)]">
            <Type className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="text-sm leading-relaxed">
              {placeholder}
            </span>
          </div>
        )}
      </div>

      <style jsx>{`
        [contenteditable] h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.875rem 0;
        }
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.75rem 0;
        }
        [contenteditable] p {
          margin: 0.5rem 0;
        }
        [contenteditable] ul, [contenteditable] ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        [contenteditable] blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #9ca3af;
        }
        [contenteditable] strong {
          font-weight: bold;
        }
        [contenteditable] em {
          font-style: italic;
        }
        [contenteditable] u {
          text-decoration: underline;
        }
        [contenteditable] strike {
          text-decoration: line-through;
        }
        [contenteditable] a {
          color: #2563EB;
          text-decoration: underline;
          cursor: pointer;
        }
        [contenteditable] a:hover {
          color: #06B6D4;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}