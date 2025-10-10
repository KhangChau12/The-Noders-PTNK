'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/components/AuthProvider'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Loading } from '@/components/Loading'
import { PostForm } from '@/components/posts/PostForm'
import { BlockEditor } from '@/components/posts/BlockEditor'
import { postQueries } from '@/lib/queries'
import { Post, PostBlock } from '@/types/database'
import { calculateReadingTime } from '@/lib/utils'
import { ArrowLeft, Eye, Send, Save, Archive, Clock } from 'lucide-react'
import Link from 'next/link'

function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const { session, user } = useAuth()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [blocks, setBlocks] = useState<PostBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId])

  const fetchPost = async () => {
    try {
      setLoading(true)

      const { post: fetchedPost, blocks: fetchedBlocks, error } = await postQueries.getPost(postId, session)

      if (error) {
        alert('Failed to load post: ' + error.message)
        router.push('/dashboard/posts')
        return
      }

      // Check if user owns this post
      // Note: user might not be loaded immediately on first render after redirect
      // If user is not loaded yet, skip permission check (ProtectedRoute will handle auth)
      if (fetchedPost && user && fetchedPost.author_id !== user.id) {
        alert('You do not have permission to edit this post')
        router.push('/dashboard/posts')
        return
      }

      setPost(fetchedPost)
      setBlocks(fetchedBlocks || [])
    } catch (err) {
      alert('Error loading post')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateInfo = async (data: {
    title: string
    summary: string
    category: string
    thumbnail_image_id?: string
  }) => {
    try {
      setSaving(true)

      // Optimistic update
      if (post) {
        setPost({ ...post, ...data })
      }

      const { post: updatedPost, error } = await postQueries.updatePost(postId, data, session)

      if (error) {
        alert('Failed to update post: ' + error.message)
        // Rollback on error
        fetchPost()
      } else if (updatedPost) {
        setPost(updatedPost)
        alert('Post information updated!')
      }
    } catch (err) {
      alert('Network error occurred')
      fetchPost()
    } finally {
      setSaving(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!post) return

    try {
      setSaving(true)

      // If post is published, calculate and update reading time
      const updates: any = {
        status: 'draft',
        title: post.title || 'Untitled Post',
        summary: post.summary || '',
        category: post.category || 'News',
        thumbnail_image_id: post.thumbnail_image_id || null,
      }

      console.log('Saving draft with updates:', updates);

      // Optimistic update
      setPost({ ...post, ...updates })

      const { post: updatedPost, error } = await postQueries.updatePost(
        postId,
        updates,
        session
      )

      if (error) {
        alert('Failed to save draft: ' + error.message)
        fetchPost() // Rollback on error
      } else if (updatedPost) {
        setPost(updatedPost)
        alert('Draft saved successfully!')
      }
    } catch (err) {
      alert('Network error occurred')
      fetchPost()
    } finally {
      setSaving(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!post) return

    try {
      setSaving(true)

      // Calculate reading time when saving published post
      const readingTime = calculateReadingTime(blocks)

      // Optimistic update
      setPost({ ...post, reading_time: readingTime })

      const { post: updatedPost, error } = await postQueries.updatePost(
        postId,
        {
          reading_time: readingTime
        },
        session
      )

      if (error) {
        alert('Failed to save changes: ' + error.message)
        fetchPost() // Rollback on error
      } else if (updatedPost) {
        setPost(updatedPost)
        alert('Reading time updated successfully!')
      }
    } catch (err) {
      alert('Network error occurred')
      fetchPost()
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!post) return

    // Validate required fields before publishing
    if (!post.title || post.title.trim() === '' || post.title === 'Untitled Post') {
      alert('Please add a title before publishing')
      return
    }

    if (!post.summary || post.summary.trim() === '') {
      alert('Please add a summary before publishing')
      return
    }

    if (!post.category) {
      alert('Please select a category before publishing')
      return
    }

    if (blocks.length === 0) {
      if (!confirm('This post has no content blocks. Publish anyway?')) {
        return
      }
    }

    try {
      setPublishing(true)

      // Calculate reading time before publishing
      const readingTime = calculateReadingTime(blocks)

      // Optimistic update
      setPost({ ...post, status: 'published', reading_time: readingTime })

      const { post: updatedPost, error } = await postQueries.updatePost(
        postId,
        {
          status: 'published',
          reading_time: readingTime
        },
        session
      )

      if (error) {
        alert('Failed to publish post: ' + error.message)
        fetchPost() // Rollback on error
      } else if (updatedPost) {
        setPost(updatedPost)
        alert('Post published successfully!')
      }
    } catch (err) {
      alert('Network error occurred')
      fetchPost()
    } finally {
      setPublishing(false)
    }
  }

  const handleArchive = async () => {
    if (!post) return

    if (!confirm('Are you sure you want to archive this post?')) {
      return
    }

    try {
      const { error } = await postQueries.updatePost(
        postId,
        { status: 'archived' },
        session
      )

      if (error) {
        alert('Failed to archive post: ' + error.message)
      } else {
        alert('Post archived!')
        router.push('/dashboard/posts')
      }
    } catch (err) {
      alert('Network error occurred')
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Loading size="lg" text="Loading post..." />
        </div>
      </ProtectedRoute>
    )
  }

  if (!post) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-text-secondary">Post not found</p>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard/posts">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to My Posts
              </Button>
            </Link>

            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-text-primary">
                    Edit Post
                  </h1>
                  <Badge
                    variant={
                      post.status === 'published' ? 'success' :
                        post.status === 'draft' ? 'secondary' :
                          'default'
                    }
                  >
                    {post.status}
                  </Badge>
                </div>
                <p className="text-text-secondary">
                  Update post information and manage content blocks
                </p>
              </div>

              {post.status === 'published' && (
                <Link href={`/posts/${post.slug}`} target="_blank">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Live
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Post Information */}
            <PostForm
              post={post}
              onSave={handleUpdateInfo}
              saving={saving}
              session={session}
            />

            {/* Blocks Editor */}
            <BlockEditor
              blocks={blocks}
              postId={postId}
              onBlocksChange={(updatedBlocks) => {
                // Update blocks locally instead of refetching
                if (updatedBlocks) {
                  setBlocks(updatedBlocks)
                }
              }}
              session={session}
            />
          </div>

          {/* Action Buttons - Sticky at bottom */}
          <div className="sticky bottom-0 z-10 mt-8 p-4 bg-dark-surface/95 backdrop-blur-sm rounded-lg border border-dark-border shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-text-tertiary">
                <Clock className="w-4 h-4" />
                <span>Reading time: <strong className="text-primary-blue">{calculateReadingTime(blocks)} min</strong></span>
                {post.reading_time !== calculateReadingTime(blocks) && (
                  <span className="text-xs text-warning">⚠️ Changed</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {post.status === 'published' ? (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveChanges}
                      disabled={saving || post.reading_time === calculateReadingTime(blocks)}
                    >
                      {saving ? 'Saving...' : (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Update Reading Time
                        </>
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSaveDraft}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Unpublish
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSaveDraft}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Draft
                        </>
                      )}
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handlePublish}
                      disabled={publishing}
                    >
                      {publishing ? 'Publishing...' : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Publish
                        </>
                      )}
                    </Button>
                  </>
                )}

                {post.status !== 'archived' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleArchive}
                    className="text-text-tertiary"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 p-4 bg-dark-surface rounded-lg border border-dark-border">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <span className="text-text-tertiary">
                  Views: <strong className="text-text-primary">{post.view_count}</strong>
                </span>
                <span className="text-text-tertiary">
                  Upvotes: <strong className="text-text-primary">{post.upvote_count}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-blue" />
                  <span className="text-text-tertiary">
                    Reading time: <strong className="text-primary-blue">{calculateReadingTime(blocks)} min</strong>
                    {post.reading_time !== calculateReadingTime(blocks) && (
                      <span className="ml-1 text-xs text-text-tertiary">
                        (saved: {post.reading_time} min)
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <span className="text-text-tertiary">
                Last updated: {new Date(post.updated_at).toLocaleString()}
              </span>
            </div>
            {post.reading_time !== calculateReadingTime(blocks) && (
              <div className="mt-2 text-xs text-warning flex items-center gap-1">
                <span>⚠️ Reading time has changed. Publish to update.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default EditPostPage