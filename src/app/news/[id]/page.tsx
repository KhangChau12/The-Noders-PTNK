'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Loading } from '@/components/Loading'
import { NewsPost } from '@/lib/posts'
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

function ShareButton() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnSocial = (platform: string) => {
    const url = encodeURIComponent(window.location.href)
    const title = encodeURIComponent(document.title)

    let shareUrl = ''
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-text-secondary font-medium">Share:</span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => shareOnSocial('facebook')}
          className="p-3 rounded-full bg-blue-600/20 hover:bg-blue-600/30 transition-colors group"
          title="Share on Facebook"
        >
          <Facebook className="w-4 h-4 text-blue-500 group-hover:text-blue-400 transition-colors" />
        </button>

        <button
          onClick={() => shareOnSocial('twitter')}
          className="p-3 rounded-full bg-sky-600/20 hover:bg-sky-600/30 transition-colors group"
          title="Share on Twitter"
        >
          <Twitter className="w-4 h-4 text-sky-500 group-hover:text-sky-400 transition-colors" />
        </button>

        <button
          onClick={() => shareOnSocial('linkedin')}
          className="p-3 rounded-full bg-blue-700/20 hover:bg-blue-700/30 transition-colors group"
          title="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4 text-blue-600 group-hover:text-blue-500 transition-colors" />
        </button>

        <button
          onClick={copyToClipboard}
          className={`p-3 rounded-full transition-all ${
            copied
              ? 'bg-success/20 scale-110'
              : 'bg-gray-600/20 hover:bg-gray-600/30'
          }`}
          title="Copy link"
        >
          {copied ? (
            <CheckCircle className="w-4 h-4 text-success" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-300 transition-colors" />
          )}
        </button>
      </div>
    </div>
  )
}

export default function NewsPostPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.id as string
  const [post, setPost] = useState<NewsPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)

        // Fetch current post
        const postResponse = await fetch(`/api/posts/${slug}`)
        const postData = await postResponse.json()

        if (postData.success) {
          setPost(postData.post)
          setError(null)

          // Fetch related posts
          const relatedResponse = await fetch('/api/posts')
          const relatedData = await relatedResponse.json()

          if (relatedData.success) {
            // Filter out current post and take first 2
            const related = relatedData.posts
              .filter((p: NewsPost) => p.slug !== slug)
              .slice(0, 2)
            setRelatedPosts(related)
          }
        } else {
          setError(postData.error || 'Post not found')
        }
      } catch (err) {
        setError('Network error occurred')
        console.error('Error fetching post:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Loading />
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4 opacity-50">📰</div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                {error || 'Post Not Found'}
              </h2>
              <p className="text-text-secondary mb-6">
                The post you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => router.push('/news')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to News
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            href="/news"
            className="inline-flex items-center text-text-secondary hover:text-primary-blue transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News
          </Link>
        </div>

        <article>
          {/* Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              {post.image && (
                <div className="aspect-video relative rounded-lg overflow-hidden mb-8 shadow-xl">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="primary" size="lg">{post.category.replace('-', ' ')}</Badge>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {!post.image && (
                  <Badge variant="primary" size="lg">{post.category.replace('-', ' ')}</Badge>
                )}

                <h1 className="text-3xl md:text-5xl font-bold text-text-primary leading-tight">
                  {post.title}
                </h1>

                <p className="text-xl text-text-secondary leading-relaxed max-w-4xl">
                  {post.excerpt}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-dark-border">
                  <div className="flex items-center gap-8 text-sm text-text-tertiary">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-blue/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-blue" />
                      </div>
                      <div>
                        <p className="text-text-primary font-medium">{post.author}</p>
                        <p className="text-text-tertiary text-xs">Author</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent-cyan/20 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-accent-cyan" />
                      </div>
                      <div>
                        <p className="text-text-primary font-medium">{new Date(post.date).toLocaleDateString()}</p>
                        <p className="text-text-tertiary text-xs">Published</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="text-text-primary font-medium">{post.readTime} min</p>
                        <p className="text-text-tertiary text-xs">Read time</p>
                      </div>
                    </div>
                  </div>

                  <ShareButton />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="prose prose-invert prose-lg max-w-none">
                <div
                  className="
                    leading-relaxed
                    prose-headings:text-text-primary prose-headings:font-semibold prose-headings:border-b prose-headings:border-dark-border prose-headings:pb-2 prose-headings:mb-4
                    prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-6
                    prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:mt-5 prose-h3:mb-3
                    prose-p:text-text-secondary prose-p:mb-4 prose-p:leading-7
                    prose-strong:text-text-primary prose-strong:font-semibold
                    prose-em:text-text-secondary
                    prose-a:text-primary-blue prose-a:underline prose-a:decoration-primary-blue/30 hover:prose-a:decoration-primary-blue prose-a:underline-offset-2
                    prose-code:text-accent-cyan prose-code:bg-dark-surface prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                    prose-pre:bg-dark-surface prose-pre:border prose-pre:border-dark-border prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
                    prose-blockquote:border-l-4 prose-blockquote:border-primary-blue prose-blockquote:bg-dark-surface prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-4 prose-blockquote:rounded-r prose-blockquote:text-text-secondary prose-blockquote:italic prose-blockquote:my-6
                    prose-ul:text-text-secondary prose-ul:mb-4 prose-ul:pl-6
                    prose-ol:text-text-secondary prose-ol:mb-4 prose-ol:pl-6
                    prose-li:mb-2 prose-li:leading-6
                    prose-img:rounded-lg prose-img:shadow-lg prose-img:my-8
                    prose-hr:border-dark-border prose-hr:my-8
                    prose-table:border prose-table:border-dark-border prose-table:rounded-lg prose-table:overflow-hidden prose-table:my-6
                    prose-th:bg-dark-surface prose-th:text-text-primary prose-th:font-semibold prose-th:p-3 prose-th:border-b prose-th:border-dark-border
                    prose-td:text-text-secondary prose-td:p-3 prose-td:border-b prose-td:border-dark-border
                  "
                  dangerouslySetInnerHTML={{ __html: post.htmlContent }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-8 bg-accent-cyan/20 rounded-lg flex items-center justify-center">
                  <span className="text-accent-cyan text-sm">#</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="tech" size="lg" className="hover:scale-105 transition-transform cursor-pointer">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-semibold text-text-primary mb-6">
              Related Posts
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} href={`/news/${relatedPost.slug}`}>
                  <Card variant="interactive" className="h-full hover-lift">
                    {relatedPost.image && (
                      <div className="aspect-video relative rounded-t-lg overflow-hidden">
                        <Image
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <Badge variant="secondary" size="sm" className="mb-2">
                        {relatedPost.category.replace('-', ' ')}
                      </Badge>

                      <h4 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
                        {relatedPost.title}
                      </h4>

                      <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-xs text-text-tertiary">
                        <span>{new Date(relatedPost.date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          Read More <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <Card className="mt-16 bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20">
          <CardContent className="text-center p-8">
            <h3 className="text-xl font-semibold text-text-primary mb-4">
              Stay Updated
            </h3>
            <p className="text-text-secondary mb-6">
              Don't miss our latest news, project updates, and member stories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/news">View All Posts</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/contact">Get In Touch</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}