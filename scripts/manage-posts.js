#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const contentDir = path.join(__dirname, '../content/news')

// Helper functions
function ensureContentDir() {
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true })
  }
}

function listPosts(showDetails = false) {
  ensureContentDir()

  const files = fs.readdirSync(contentDir)
    .filter(file => file.endsWith('.md'))
    .sort()
    .reverse()

  if (files.length === 0) {
    console.log('📰 No posts found.')
    return
  }

  console.log(`📰 Found ${files.length} posts:\n`)

  files.forEach((file, index) => {
    const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '')
    const filePath = path.join(contentDir, file)

    console.log(`${index + 1}. ${file}`)
    console.log(`   🔗 URL: /news/${slug}`)
    console.log(`   📁 File: content/news/${file}`)

    if (showDetails) {
      try {
        const content = fs.readFileSync(filePath, 'utf8')
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)

        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1]
          const titleMatch = frontmatter.match(/title:\s*"([^"]*)"/)
          const categoryMatch = frontmatter.match(/category:\s*"([^"]*)"/)
          const featuredMatch = frontmatter.match(/featured:\s*(true|false)/)

          if (titleMatch) console.log(`   📝 Title: ${titleMatch[1]}`)
          if (categoryMatch) console.log(`   📂 Category: ${categoryMatch[1]}`)
          if (featuredMatch) console.log(`   ⭐ Featured: ${featuredMatch[1]}`)
        }
      } catch (error) {
        console.log(`   ❌ Error reading file: ${error.message}`)
      }
    }

    console.log('')
  })
}

function deletePost(identifier) {
  ensureContentDir()

  const files = fs.readdirSync(contentDir)
    .filter(file => file.endsWith('.md'))

  // Find file by slug or filename
  const matchingFile = files.find(file => {
    const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '')
    return file === identifier || slug === identifier || file === `${identifier}.md`
  })

  if (!matchingFile) {
    console.error(`❌ Post not found: ${identifier}`)
    console.log('\n💡 Available posts:')
    listPosts()
    return
  }

  const filePath = path.join(contentDir, matchingFile)

  try {
    fs.unlinkSync(filePath)
    console.log(`✅ Post deleted: ${matchingFile}`)
    console.log(`🗑️  File removed: ${filePath}`)
  } catch (error) {
    console.error(`❌ Error deleting post: ${error.message}`)
  }
}

function validatePosts() {
  ensureContentDir()

  const files = fs.readdirSync(contentDir)
    .filter(file => file.endsWith('.md'))

  let totalPosts = 0
  let validPosts = 0
  let errors = []

  console.log('🔍 Validating posts...\n')

  files.forEach(file => {
    totalPosts++
    const filePath = path.join(contentDir, file)

    try {
      const content = fs.readFileSync(filePath, 'utf8')

      // Check frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
      if (!frontmatterMatch) {
        errors.push(`${file}: Missing frontmatter`)
        return
      }

      const frontmatter = frontmatterMatch[1]
      const requiredFields = ['title', 'excerpt', 'category', 'author', 'date']

      for (const field of requiredFields) {
        if (!frontmatter.includes(`${field}:`)) {
          errors.push(`${file}: Missing required field '${field}'`)
          return
        }
      }

      // Check category value
      const categoryMatch = frontmatter.match(/category:\s*"([^"]*)"/)
      if (categoryMatch) {
        const validCategories = ['announcement', 'project', 'member-spotlight', 'technical', 'event']
        if (!validCategories.includes(categoryMatch[1])) {
          errors.push(`${file}: Invalid category '${categoryMatch[1]}'`)
          return
        }
      }

      // Check date format
      const dateMatch = frontmatter.match(/date:\s*"([^"]*)"/)
      if (dateMatch) {
        const dateStr = dateMatch[1]
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          errors.push(`${file}: Invalid date format '${dateStr}' (should be YYYY-MM-DD)`)
          return
        }
      }

      // Check content after frontmatter
      const contentAfterFrontmatter = content.split('---').slice(2).join('---').trim()
      if (contentAfterFrontmatter.length < 100) {
        errors.push(`${file}: Content too short (${contentAfterFrontmatter.length} chars)`)
        return
      }

      validPosts++
      console.log(`✅ ${file}`)

    } catch (error) {
      errors.push(`${file}: Error reading file - ${error.message}`)
    }
  })

  console.log(`\n📊 Validation Summary:`)
  console.log(`   Total posts: ${totalPosts}`)
  console.log(`   Valid posts: ${validPosts}`)
  console.log(`   Errors: ${errors.length}`)

  if (errors.length > 0) {
    console.log(`\n❌ Errors found:`)
    errors.forEach(error => console.log(`   • ${error}`))
  } else {
    console.log(`\n🎉 All posts are valid!`)
  }
}

function showStats() {
  ensureContentDir()

  const files = fs.readdirSync(contentDir)
    .filter(file => file.endsWith('.md'))

  const stats = {
    total: 0,
    featured: 0,
    categories: {},
    authors: {},
    recentPosts: 0
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  files.forEach(file => {
    stats.total++

    try {
      const content = fs.readFileSync(path.join(contentDir, file), 'utf8')
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)

      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1]

        // Count categories
        const categoryMatch = frontmatter.match(/category:\s*"([^"]*)"/)
        if (categoryMatch) {
          const category = categoryMatch[1]
          stats.categories[category] = (stats.categories[category] || 0) + 1
        }

        // Count authors
        const authorMatch = frontmatter.match(/author:\s*"([^"]*)"/)
        if (authorMatch) {
          const author = authorMatch[1]
          stats.authors[author] = (stats.authors[author] || 0) + 1
        }

        // Count featured
        const featuredMatch = frontmatter.match(/featured:\s*true/)
        if (featuredMatch) {
          stats.featured++
        }

        // Count recent posts
        const dateMatch = frontmatter.match(/date:\s*"([^"]*)"/)
        if (dateMatch) {
          const postDate = new Date(dateMatch[1])
          if (postDate >= thirtyDaysAgo) {
            stats.recentPosts++
          }
        }
      }
    } catch (error) {
      // Skip invalid files
    }
  })

  console.log('📊 Post Statistics:\n')
  console.log(`📰 Total Posts: ${stats.total}`)
  console.log(`⭐ Featured Posts: ${stats.featured}`)
  console.log(`🆕 Recent Posts (30 days): ${stats.recentPosts}`)

  console.log('\n📂 Posts by Category:')
  Object.entries(stats.categories)
    .sort(([, a], [, b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`   • ${category}: ${count}`)
    })

  console.log('\n✍️ Posts by Author:')
  Object.entries(stats.authors)
    .sort(([, a], [, b]) => b - a)
    .forEach(([author, count]) => {
      console.log(`   • ${author}: ${count}`)
    })
}

// Main command handler
function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    console.log(`
📰 AI Agent Club - Post Management Tool

Usage: node manage-posts.js <command> [options]

Commands:
  list [--details]     List all posts
  delete <identifier>  Delete a post by slug or filename
  validate            Validate all posts for correct format
  stats               Show statistics about posts
  help                Show this help message

Examples:
  node manage-posts.js list
  node manage-posts.js list --details
  node manage-posts.js delete my-post-slug
  node manage-posts.js delete 2024-01-15-my-post.md
  node manage-posts.js validate
  node manage-posts.js stats

Note: Use create-post.js to create new posts.
`)
    return
  }

  const command = args[0]

  switch (command) {
    case 'list':
    case 'ls':
      const showDetails = args.includes('--details') || args.includes('-d')
      listPosts(showDetails)
      break

    case 'delete':
    case 'rm':
      if (args.length < 2) {
        console.error('❌ Please provide a post identifier to delete.')
        console.log('Usage: node manage-posts.js delete <slug-or-filename>')
        return
      }
      deletePost(args[1])
      break

    case 'validate':
    case 'check':
      validatePosts()
      break

    case 'stats':
    case 'statistics':
      showStats()
      break

    default:
      console.error(`❌ Unknown command: ${command}`)
      console.log('Run "node manage-posts.js help" for usage information.')
  }
}

main()