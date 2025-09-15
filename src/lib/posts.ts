import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

export interface NewsPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  htmlContent: string
  category: 'announcement' | 'project' | 'member-spotlight' | 'technical' | 'event'
  author: string
  date: string
  readTime: number
  image?: string
  tags: string[]
  featured?: boolean
}

export interface PostMetadata {
  title: string
  excerpt: string
  category: string
  author: string
  date: string
  readTime?: number
  image?: string
  tags: string[]
  featured?: boolean
}

const postsDirectory = path.join(process.cwd(), 'content', 'news')

// Ensure posts directory exists
function ensurePostsDirectory() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true })
  }
}

// Get all post file names
function getPostFiles(): string[] {
  ensurePostsDirectory()

  try {
    const files = fs.readdirSync(postsDirectory)
    return files.filter(file => file.endsWith('.md'))
  } catch (error) {
    console.warn('Error reading posts directory:', error)
    return []
  }
}

// Calculate reading time based on word count
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

// Generate slug from filename
function generateSlug(filename: string): string {
  return filename.replace(/\.md$/, '')
}

// Generate ID from slug (can be same as slug for simplicity)
function generateId(slug: string): string {
  return slug
}

// Parse a single post file
export function parsePost(filename: string): NewsPost | null {
  try {
    const filePath = path.join(postsDirectory, filename)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)

    const metadata = data as PostMetadata
    const slug = generateSlug(filename)
    const id = generateId(slug)

    // Convert markdown to HTML
    const htmlContent = marked(content)

    return {
      id,
      slug,
      title: metadata.title,
      excerpt: metadata.excerpt,
      content,
      htmlContent,
      category: metadata.category as NewsPost['category'],
      author: metadata.author,
      date: metadata.date,
      readTime: metadata.readTime || calculateReadTime(content),
      image: metadata.image,
      tags: metadata.tags || [],
      featured: metadata.featured || false
    }
  } catch (error) {
    console.error(`Error parsing post ${filename}:`, error)
    return null
  }
}

// Get all posts
export function getAllPosts(): NewsPost[] {
  const files = getPostFiles()

  const posts = files
    .map(parsePost)
    .filter((post): post is NewsPost => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return posts
}

// Get post by slug/id
export function getPostBySlug(slug: string): NewsPost | null {
  const files = getPostFiles()
  const filename = files.find(file => generateSlug(file) === slug)

  if (!filename) {
    return null
  }

  return parsePost(filename)
}

// Get posts by category
export function getPostsByCategory(category: string): NewsPost[] {
  const allPosts = getAllPosts()

  if (category === 'all') {
    return allPosts
  }

  return allPosts.filter(post => post.category === category)
}

// Search posts by query
export function searchPosts(query: string): NewsPost[] {
  const allPosts = getAllPosts()
  const searchTerm = query.toLowerCase()

  return allPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm) ||
    post.excerpt.toLowerCase().includes(searchTerm) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  )
}

// Get featured posts
export function getFeaturedPosts(): NewsPost[] {
  const allPosts = getAllPosts()
  return allPosts.filter(post => post.featured)
}

// Get recent posts (for homepage)
export function getRecentPosts(limit: number = 3): NewsPost[] {
  const allPosts = getAllPosts()
  return allPosts.slice(0, limit)
}

// Utility function to create a new post file
export function createPostTemplate(
  slug: string,
  metadata: Partial<PostMetadata>
): string {
  const template = `---
title: "${metadata.title || 'New Post Title'}"
excerpt: "${metadata.excerpt || 'Post excerpt...'}"
category: "${metadata.category || 'announcement'}"
author: "${metadata.author || 'AI Agent Club'}"
date: "${metadata.date || new Date().toISOString().split('T')[0]}"
tags: [${(metadata.tags || []).map(tag => `"${tag}"`).join(', ')}]
featured: ${metadata.featured || false}
${metadata.image ? `image: "${metadata.image}"` : ''}
---

# ${metadata.title || 'New Post Title'}

Write your post content here using markdown...

## Section Example

This is an example section. You can use:

- **Bold text**
- *Italic text*
- [Links](https://example.com)
- \`inline code\`

### Code blocks

\`\`\`javascript
const example = 'Hello World'
console.log(example)
\`\`\`

### Lists

1. Numbered item 1
2. Numbered item 2
3. Numbered item 3

### Quotes

> This is a quote block example.

---

*End of post content*
`

  return template
}

// Get post statistics
export function getPostStats() {
  const allPosts = getAllPosts()

  const categoryStats = allPosts.reduce((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    total: allPosts.length,
    featured: allPosts.filter(p => p.featured).length,
    categories: categoryStats,
    recentCount: allPosts.filter(p => {
      const postDate = new Date(p.date)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return postDate >= thirtyDaysAgo
    }).length
  }
}