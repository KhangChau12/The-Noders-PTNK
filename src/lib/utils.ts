import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date()
  const target = new Date(date)
  const diffInMs = now.getTime() - target.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}

export function generateAvatarUrl(name: string | null) {
  if (!name) {
    const svg = `
      <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#334155"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
              font-family="system-ui, -apple-system, sans-serif"
              font-size="48" fill="#CBD5E1" opacity="0.8">
          ?
        </text>
      </svg>
    `
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  const svg = `
    <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#2563EB"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="system-ui, -apple-system, sans-serif"
            font-size="48" fill="#ffffff" opacity="0.9">
        ${initials}
      </text>
    </svg>
  `
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

export function generateRandomPassword(length: number = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function getContributionColor(percentage: number) {
  if (percentage >= 40) return '#059669' // Green
  if (percentage >= 25) return '#2563EB' // Blue
  if (percentage >= 15) return '#D97706' // Orange
  return '#6B7280' // Gray
}

export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateUsername(username: string) {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
  return usernameRegex.test(username)
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

export function getInitials(name: string | null) {
  if (!name) return '?'
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

/**
 * Calculate reading time based on word count
 * Average reading speed: 200 words per minute
 * Adds padding for images (12 seconds per image)
 * @param blocks - Array of post blocks
 * @returns Reading time in minutes (minimum 1)
 */
export function calculateReadingTime(blocks: any[]): number {
  if (!blocks || blocks.length === 0) return 1

  let totalWords = 0
  let imageCount = 0

  blocks.forEach(block => {
    if (block.type === 'text') {
      // Strip HTML tags and count words
      const textContent = block.content?.html || ''
      const plainText = textContent.replace(/<[^>]*>/g, ' ').trim()
      const words = plainText.split(/\s+/).filter(w => w.length > 0)
      totalWords += words.length
    } else if (block.type === 'quote') {
      // Count words in quote
      const quoteText = block.content?.quote || ''
      const words = quoteText.split(/\s+/).filter(w => w.length > 0)
      totalWords += words.length
    } else if (block.type === 'image') {
      // Each image adds ~12 seconds (0.2 minutes) to reading time
      imageCount++
    }
    // YouTube videos are not counted towards reading time
  })

  // Calculate reading time
  // 200 words per minute + 12 seconds (0.2 min) per image
  const readingMinutes = totalWords / 200
  const imageMinutes = imageCount * 0.2
  const totalMinutes = readingMinutes + imageMinutes

  // Round to nearest minute, minimum 1
  return Math.max(1, Math.round(totalMinutes))
}

export function calculateProjectStats(contributors: any[]) {
  const totalContribution = contributors.reduce(
    (sum, c) => sum + (c.contribution_percentage || 0), 
    0
  )
  
  return {
    totalContribution,
    contributorCount: contributors.length,
    averageContribution: contributors.length > 0 
      ? totalContribution / contributors.length 
      : 0
  }
}