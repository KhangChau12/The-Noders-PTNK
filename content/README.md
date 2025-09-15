# 📰 AI Agent Club - Post Management

This directory contains the markdown-based content management system for the AI Agent Club website news/blog section.

## 📁 Directory Structure

```
content/
└── news/
    ├── 2024-01-15-ml-workshop-series.md
    ├── 2024-01-12-alice-johnson-spotlight.md
    ├── 2024-01-10-smart-home-award.md
    └── 2024-01-08-neural-networks-deep-dive.md
```

## ✍️ Creating New Posts

### Method 1: Using CLI Tool (Recommended)

```bash
# Create a new post
node scripts/create-post.js my-new-post --title "My New Post" --category "announcement"

# Create with all options
node scripts/create-post.js awesome-tutorial \
  --title "How to Build Awesome AI Projects" \
  --excerpt "A comprehensive guide to building AI projects" \
  --category "technical" \
  --author "John Doe" \
  --tags "AI,Tutorial,Guide" \
  --featured \
  --image "https://example.com/image.jpg"
```

### Method 2: Manual Creation

1. Create a new `.md` file in `content/news/` with format: `YYYY-MM-DD-slug.md`
2. Add frontmatter and content (see template below)

## 📝 Post Format

Each post must have **frontmatter** (metadata) and **markdown content**:

```markdown
---
title: "Your Post Title"
excerpt: "Brief description of your post"
category: "announcement"
author: "Your Name"
date: "2024-01-15"
tags: ["Tag1", "Tag2", "Tag3"]
featured: false
image: "https://example.com/image.jpg"
---

# Your Post Title

Write your content here using **Markdown**...

## Sections

- Use standard markdown syntax
- Images, links, code blocks all supported
- Content will be converted to HTML automatically

```

### Required Frontmatter Fields

- `title`: Post title (string, quoted)
- `excerpt`: Short description for previews (string, quoted)
- `category`: Post category (see categories below)
- `author`: Author name (string, quoted)
- `date`: Publication date in YYYY-MM-DD format (string, quoted)

### Optional Frontmatter Fields

- `tags`: Array of tags `["tag1", "tag2"]`
- `featured`: Boolean, shows in featured section if `true`
- `image`: Featured image URL for previews

## 📂 Post Categories

- **announcement**: News and announcements
- **project**: Project showcases and updates
- **member-spotlight**: Member features and interviews
- **technical**: Technical tutorials and guides
- **event**: Events and meetups

## 🛠️ Management Tools

### Create Posts
```bash
node scripts/create-post.js <slug> [options]
```

### Manage Existing Posts
```bash
# List all posts
node scripts/manage-posts.js list

# List with details
node scripts/manage-posts.js list --details

# Delete a post
node scripts/manage-posts.js delete my-post-slug

# Validate all posts
node scripts/manage-posts.js validate

# Show statistics
node scripts/manage-posts.js stats
```

## 🔍 How It Works

1. **Markdown Files**: Posts are stored as `.md` files with frontmatter
2. **API Routes**: Next.js API routes (`/api/posts`) serve the content
3. **Build Time**: Posts are read from filesystem and converted to HTML
4. **Dynamic Routing**: Each post accessible at `/news/[slug]`

## 📖 Markdown Tips

### Headings
```markdown
# Main Title (H1)
## Section (H2)
### Subsection (H3)
```

### Text Formatting
```markdown
**Bold text**
*Italic text*
`Inline code`
~~Strikethrough~~
```

### Links and Images
```markdown
[Link text](https://example.com)
![Alt text](https://example.com/image.jpg)
```

### Code Blocks
```markdown
\`\`\`javascript
const example = 'Hello World'
console.log(example)
\`\`\`
```

### Lists
```markdown
- Unordered item 1
- Unordered item 2

1. Ordered item 1
2. Ordered item 2
```

### Quotes
```markdown
> This is a blockquote
>
> It can span multiple lines
```

## 🚀 Deployment

Posts are automatically picked up when:
1. Files are added to `content/news/`
2. Next.js app is restarted/redeployed
3. No database required - filesystem-based

## ⚠️ Important Notes

- **File Naming**: Use `YYYY-MM-DD-slug.md` format
- **Slug Generation**: Filename determines URL (`/news/slug`)
- **Validation**: Use `manage-posts.js validate` before deployment
- **Backup**: Keep content in version control (git)

## 🔧 Troubleshooting

### Post Not Showing Up
1. Check file format and naming convention
2. Validate frontmatter with `manage-posts.js validate`
3. Restart Next.js development server
4. Check API route: `/api/posts`

### Markdown Not Rendering
1. Ensure proper frontmatter separation (`---`)
2. Check for syntax errors in markdown
3. Validate post structure

### Build Errors
1. Run `manage-posts.js validate` to check all posts
2. Fix any validation errors
3. Ensure required frontmatter fields are present

---

**Need help?** Contact the development team or check the [project documentation](../README.md).