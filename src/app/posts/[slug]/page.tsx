'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Loading } from '@/components/Loading'
import { useAuth } from '@/components/AuthProvider'
import { useLanguage } from '@/components/LanguageProvider'
import { LanguageDropdown } from '@/components/LanguageDropdown'
import { Post, PostBlock } from '@/types/database'
import { postQueries } from '@/lib/queries'
import {
  Calendar,
  Clock,
  User,
  ThumbsUp,
  Eye,
  ArrowLeft,
  Share2,
  AlertCircle
} from 'lucide-react'

interface PostWithDetails extends Post {
  author?: {
    id: string
    username: string
    full_name: string
    avatar_url: string | null
  }
  thumbnail_image?: {
    public_url: string
  }
}

function CategoryBadge({ category }: { category: Post['category'] }) {
  const config = {
    'News': { label: 'News', variant: 'primary' as const },
    'You may want to know': { label: 'Did You Know?', variant: 'tech' as const },
    'Member Spotlight': { label: 'Member Spotlight', variant: 'success' as const },
    'Community Activities': { label: 'Activities', variant: 'warning' as const }
  }

  const { label, variant } = config[category]
  return <Badge variant={variant}>{label}</Badge>
}

// Helper to add target="_blank" to all links in HTML
function processLinksInHTML(html: string): string {
  return html.replace(
    /<a\s+([^>]*href=["'][^"']*["'][^>]*)>/gi,
    (match, attributes) => {
      // Check if target attribute already exists
      if (/target=/i.test(attributes)) {
        return match
      }
      // Add target="_blank" and rel="noopener noreferrer"
      return `<a ${attributes} target="_blank" rel="noopener noreferrer">`
    }
  )
}

function RenderBlock({ block, lang }: { block: PostBlock, lang: 'en' | 'vi' }) {
  switch (block.type) {
    case 'text':
      const textContent = block.content as any
      const htmlField = lang === 'vi' ? (textContent.html_vi) : (textContent.html)
      const processedHTML = processLinksInHTML(htmlField || '')
      return (
        <div
          className="prose prose-invert max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: processedHTML }}
        />
      )

    case 'quote':
      const quoteContent = block.content as any
      const quoteText = lang === 'vi' ? (quoteContent.quote_vi || quoteContent.quote) : (quoteContent.quote_en || quoteContent.quote)
      return (
        <Card className="bg-primary-blue/5 border-primary-blue/20 mb-8">
          <CardContent className="p-6">
            <blockquote className="text-lg italic text-text-primary mb-4">
              "{quoteText}"
            </blockquote>
            {(quoteContent.author || quoteContent.source) && (
              <div className="text-sm text-text-secondary">
                — {quoteContent.author}
                {quoteContent.source && <span>, {quoteContent.source}</span>}
              </div>
            )}
          </CardContent>
        </Card>
      )

    case 'image':
      const imageContent = block.content as { image_id: string; caption?: string; alt_text?: string }
      const blockImage = (block as any).image
      return (
        <div className="mb-8">
          <div className="aspect-video relative overflow-hidden rounded-lg bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20">
            {blockImage?.public_url ? (
              <Image
                src={blockImage.public_url}
                alt={imageContent.alt_text || blockImage.alt_text || 'Post image'}
                fill
                className="object-cover"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-text-tertiary bg-dark-surface/50 backdrop-blur-sm">
                <svg
                  className="w-12 h-12 mb-2 opacity-60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
                <span className="text-sm font-medium">Image</span>
              </div>
            )}
          </div>
          {imageContent.caption && (
            <p className="text-sm text-text-tertiary text-center mt-2 italic">
              {imageContent.caption}
            </p>
          )}
        </div>
      )

    case 'youtube':
      const youtubeContent = block.content as { youtube_url: string; video_id: string; title?: string }
      return (
        <div className="mb-8">
          <div className="aspect-video relative overflow-hidden rounded-lg">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeContent.video_id}`}
              title={youtubeContent.title || 'YouTube video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          {youtubeContent.title && (
            <p className="text-sm text-text-tertiary text-center mt-2">
              {youtubeContent.title}
            </p>
          )}
        </div>
      )

    default:
      return null
  }
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { session } = useAuth()
  const { lang, localize } = useLanguage()
  const slug = params.slug as string

  const [post, setPost] = useState<PostWithDetails | null>(null)
  const [blocks, setBlocks] = useState<PostBlock[]>([])
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([])
  const [userHasUpvoted, setUserHasUpvoted] = useState(false)
  const [upvoteCount, setUpvoteCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [upvoting, setUpvoting] = useState(false)
  const [showAuthMessage, setShowAuthMessage] = useState(false)
  const viewCountIncrementedRef = useRef<string | null>(null)

  useEffect(() => {
    fetchPost()
  }, [slug])

  // Separate effect to increment view count only once per post
  useEffect(() => {
    const incrementViewCount = async () => {
      if (post && post.status === 'published' && viewCountIncrementedRef.current !== post.id) {
        viewCountIncrementedRef.current = post.id
        try {
          await fetch(`/api/posts/${post.id}/view`, { method: 'POST' })
        } catch (err) {
          console.error('Failed to increment view count:', err)
        }
      }
    }

    incrementViewCount()
  }, [post?.id, post?.status])

  const fetchPost = async () => {
    try {
      setLoading(true)
      setError(null)

      // Single optimized API call - get post by slug with all details
      const response = await postQueries.getPostBySlug(slug, session)

      if (response.error) {
        setError(response.error.message)
        return
      }

      if (!response.post) {
        setError('Post not found')
        return
      }

      setPost(response.post)
      setBlocks(response.blocks || [])
      setUserHasUpvoted(response.userHasUpvoted || false)
      setUpvoteCount(response.post?.upvote_count || 0)

      // Lazy load related posts after main content
      if (response.post?.id) {
        postQueries.getRelatedPosts(response.post.id, response.post.category, session)
          .then(related => {
            setRelatedPosts(related || [])
          })
          .catch(err => console.error('Failed to load related posts:', err))
      }

    } catch (err) {
      setError('Failed to load post')
      console.error('Error fetching post:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpvote = async () => {
    if (!session) {
      setShowAuthMessage(true)
      setTimeout(() => setShowAuthMessage(false), 5000)
      return
    }

    if (!post) return

    try {
      setUpvoting(true)
      const { upvoted, upvoteCount: newCount, error } = await postQueries.toggleUpvote(post.id, session)

      if (error) {
        setError('Failed to upvote: ' + error.message)
      } else {
        setUserHasUpvoted(upvoted || false)
        setUpvoteCount(newCount || 0)
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setUpvoting(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading post..." />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                {error || 'Post Not Found'}
              </h3>
              <p className="text-text-secondary mb-6">
                The post you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/posts">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Posts
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const thumbnailSrc = post.thumbnail_image?.public_url || post.thumbnail_url

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button & Language Selector */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/posts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Posts
            </Button>
          </Link>
          <LanguageDropdown />
        </div>

        {/* Post Header */}
        <article>
          {/* Thumbnail */}
          {thumbnailSrc && (
            <div className="aspect-video relative overflow-hidden rounded-lg mb-8 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20">
              <Image
                src={thumbnailSrc}
                alt={post.thumbnail_image?.alt_text || post.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            </div>
          )}

          {/* Meta */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <CategoryBadge category={post.category} />
              {post.featured && <Badge variant="primary">Featured</Badge>}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            {localize(post.title, post.title_vi)}
          </h1>

          {/* Summary */}
          <p className="text-lg text-text-secondary mb-6">
            {localize(post.summary, post.summary_vi)}
          </p>

          {/* Author & Stats */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-text-tertiary mb-8 pb-8 border-b border-dark-border">
            {post.author && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author.full_name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(post.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {post.reading_time} min read
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {post.view_count} views
            </div>
          </div>

          {/* Content Blocks */}
          <div className="mb-12">
            {blocks.length > 0 ? (
              blocks.map((block) => (
                <RenderBlock key={block.id} block={block} lang={lang} />
              ))
            ) : (
              <Card className="text-center py-8">
                <CardContent>
                  <p className="text-text-secondary">No content available</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Auth Message */}
          {showAuthMessage && (
            <Card className="mb-6 bg-warning/10 border-warning/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
                  <div>
                    <p className="text-text-primary font-medium">Authentication Required</p>
                    <p className="text-text-secondary text-sm">You must be a member of the community to upvote posts.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between py-6 border-t border-dark-border">
            <Button
              variant={userHasUpvoted ? 'primary' : 'secondary'}
              onClick={handleUpvote}
              disabled={upvoting}
              icon={<ThumbsUp className="w-4 h-4" />}
            >
              {upvoting ? 'Loading...' : `${upvoteCount} Upvotes`}
            </Button>

            <Button variant="ghost" icon={<Share2 className="w-4 h-4" />}>
              Share
            </Button>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-text-primary mb-6">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((related) => (
                <Link key={related.id} href={`/posts/${related.slug}`}>
                  <Card variant="interactive" className="h-full hover-lift">
                    <CardContent className="p-4">
                      <CategoryBadge category={related.category} />
                      <h3 className="text-lg font-semibold text-text-primary mt-3 mb-2 line-clamp-2">
                        {related.title}
                      </h3>
                      <p className="text-sm text-text-secondary line-clamp-2">
                        {related.summary}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}