#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Create post template function
function createPostTemplate(slug, metadata = {}) {
  const date = new Date().toISOString().split('T')[0]

  return `---
title: "${metadata.title || 'New Post Title'}"
excerpt: "${metadata.excerpt || 'Post excerpt...'}"
category: "${metadata.category || 'announcement'}"
author: "${metadata.author || 'AI Agent Club'}"
date: "${metadata.date || date}"
tags: [${(metadata.tags || []).map(tag => `"${tag}"`).join(', ')}]
featured: ${metadata.featured || false}${metadata.image ? `\nimage: "${metadata.image}"` : ''}
---

# ${metadata.title || 'New Post Title'}

Write your post content here using **Markdown**...

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

*Write your content above this line*
`
}

// Main function
function createPost() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log(`
Usage: node create-post.js <slug> [options]

Options:
  --title "Post Title"
  --excerpt "Post excerpt"
  --category "announcement|project|member-spotlight|technical|event"
  --author "Author Name"
  --tags "tag1,tag2,tag3"
  --featured
  --image "https://example.com/image.jpg"

Example:
  node create-post.js my-new-post --title "My New Post" --category "announcement" --featured

Available categories:
  - announcement: News and announcements
  - project: Project showcases and updates
  - member-spotlight: Member features and interviews
  - technical: Technical tutorials and guides
  - event: Events and meetups
`)
    process.exit(1)
  }

  const slug = args[0]
  const metadata = {}

  // Parse arguments
  for (let i = 1; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--title' && i + 1 < args.length) {
      metadata.title = args[++i]
    } else if (arg === '--excerpt' && i + 1 < args.length) {
      metadata.excerpt = args[++i]
    } else if (arg === '--category' && i + 1 < args.length) {
      const category = args[++i]
      const validCategories = ['announcement', 'project', 'member-spotlight', 'technical', 'event']
      if (validCategories.includes(category)) {
        metadata.category = category
      } else {
        console.error(`Invalid category: ${category}. Valid categories: ${validCategories.join(', ')}`)
        process.exit(1)
      }
    } else if (arg === '--author' && i + 1 < args.length) {
      metadata.author = args[++i]
    } else if (arg === '--tags' && i + 1 < args.length) {
      metadata.tags = args[++i].split(',').map(tag => tag.trim())
    } else if (arg === '--featured') {
      metadata.featured = true
    } else if (arg === '--image' && i + 1 < args.length) {
      metadata.image = args[++i]
    }
  }

  // Generate filename with date prefix
  const date = new Date().toISOString().split('T')[0]
  const filename = `${date}-${slug}.md`
  const contentDir = path.join(__dirname, '../content/news')
  const filePath = path.join(contentDir, filename)

  // Check if post already exists
  if (fs.existsSync(filePath)) {
    console.error(`Post already exists: ${filename}`)
    process.exit(1)
  }

  // Create content directory if it doesn't exist
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true })
  }

  // Generate post content
  const postContent = createPostTemplate(slug, metadata)

  try {
    // Write file
    fs.writeFileSync(filePath, postContent, 'utf8')
    console.log(`✅ Post created successfully!`)
    console.log(`📁 File: ${filePath}`)
    console.log(`🔗 URL: /news/${slug}`)
    console.log(`📝 Edit the file to add your content.`)
  } catch (error) {
    console.error('Error creating post:', error.message)
    process.exit(1)
  }
}

// Helper function to list posts
function listPosts() {
  const contentDir = path.join(__dirname, '../content/news')

  if (!fs.existsSync(contentDir)) {
    console.log('No posts directory found.')
    return
  }

  const files = fs.readdirSync(contentDir)
    .filter(file => file.endsWith('.md'))
    .sort()
    .reverse()

  if (files.length === 0) {
    console.log('No posts found.')
    return
  }

  console.log(`📰 Found ${files.length} posts:\n`)

  files.forEach((file, index) => {
    const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '')
    console.log(`${index + 1}. ${file}`)
    console.log(`   🔗 /news/${slug}`)
    console.log(`   📁 content/news/${file}\n`)
  })
}

// Check if this is a list command
if (process.argv[2] === 'list' || process.argv[2] === '--list' || process.argv[2] === '-l') {
  listPosts()
} else {
  createPost()
}