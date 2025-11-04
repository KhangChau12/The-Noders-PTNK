'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/components/AuthProvider'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Loading } from '@/components/Loading'
import { postQueries } from '@/lib/queries'
import { Post } from '@/types/database'
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  ThumbsUp,
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

function UserPostsPage() {
  const router = useRouter()
  const { user, session } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'draft' | 'published' | 'archived'>('draft')
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [creatingPost, setCreatingPost] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchUserPosts()
    }
  }, [user?.id])

  const fetchUserPosts = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const { posts: userPosts, error } = await postQueries.getUserPosts(user.id)

      if (error) {
        setError(error.message)
        setPosts([])
      } else {
        setPosts(userPosts || [])
      }
    } catch (err) {
      setError('Failed to load posts')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async () => {
    try {
      setCreatingPost(true)

      // Create empty draft with minimal info
      const { post, error } = await postQueries.createPost({
        title: 'Untitled Post',
        summary: '',
        category: 'News',
      }, session)

      if (error) {
        alert('Failed to create post: ' + error.message)
      } else if (post) {
        // Use Next.js router for client-side navigation (no hard reload)
        router.push(`/dashboard/posts/${post.id}/edit`)
      }
    } catch (err) {
      alert('Network error occurred')
    } finally {
      setCreatingPost(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingPostId(postId)

      const { error } = await postQueries.deletePost(postId, session)

      if (error) {
        alert('Failed to delete post: ' + error.message)
      } else {
        await fetchUserPosts()
      }
    } catch (err) {
      alert('Network error occurred')
    } finally {
      setDeletingPostId(null)
    }
  }

  const filteredPosts = posts.filter(post => post.status === activeTab)

  const PostCard = ({ post }: { post: Post }) => {
    const thumbnailSrc = (post as any).thumbnail_image?.public_url

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {/* Thumbnail Image */}
        {thumbnailSrc && (
          <div className="aspect-video relative bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20">
            <img
              src={thumbnailSrc}
              alt={(post as any).thumbnail_image?.alt_text || post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                {post.summary}
              </p>
            </div>
            <Badge
              variant={
                post.status === 'published' ? 'success' :
                post.status === 'draft' ? 'secondary' :
                'default'
              }
              size="sm"
              className="ml-4"
            >
              {post.status}
            </Badge>
          </div>

        <div className="flex items-center gap-4 text-sm text-text-tertiary mb-4">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {post.view_count}
          </div>
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            {post.upvote_count}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {post.reading_time} min
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(post.created_at).toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="tech" size="sm">
            {post.category}
          </Badge>
          {post.featured && (
            <Badge variant="primary" size="sm">
              Featured
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-dark-border">
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/posts/${post.id}/edit`}>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </Link>
            {post.status === 'published' && (
              <Link href={`/posts/${post.slug}`}>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
              </Link>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeletePost(post.id)}
            disabled={deletingPostId === post.id}
            className="text-error hover:text-error hover:bg-error/10"
          >
            {deletingPostId === post.id ? (
              <div className="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
    )
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Loading size="lg" text="Loading your posts..." />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                My Posts
              </h1>
              <p className="text-text-secondary">
                Manage your posts and content
              </p>
            </div>
            <Button onClick={handleCreatePost} disabled={creatingPost}>
              <Plus className="w-4 h-4 mr-2" />
              {creatingPost ? 'Creating...' : 'Create Post'}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary-blue mb-1">
                  {posts.length}
                </div>
                <div className="text-sm text-text-secondary">
                  Total Posts
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-accent-green mb-1">
                  {posts.filter(p => p.status === 'published').length}
                </div>
                <div className="text-sm text-text-secondary">
                  Published
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-accent-yellow mb-1">
                  {posts.filter(p => p.status === 'draft').length}
                </div>
                <div className="text-sm text-text-secondary">
                  Drafts
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-accent-cyan mb-1">
                  {posts.reduce((sum, p) => sum + p.upvote_count, 0)}
                </div>
                <div className="text-sm text-text-secondary">
                  Total Upvotes
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-1 mb-6 bg-dark-surface rounded-lg p-1">
            <button
              onClick={() => setActiveTab('draft')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'draft'
                  ? 'bg-primary-blue text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Drafts ({posts.filter(p => p.status === 'draft').length})
            </button>
            <button
              onClick={() => setActiveTab('published')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'published'
                  ? 'bg-primary-blue text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Published ({posts.filter(p => p.status === 'published').length})
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'archived'
                  ? 'bg-primary-blue text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Archived ({posts.filter(p => p.status === 'archived').length})
            </button>
          </div>

          {/* Error State */}
          {error && (
            <Card className="text-center py-12 mb-6">
              <CardContent>
                <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Error Loading Posts
                </h3>
                <p className="text-text-secondary mb-4">{error}</p>
                <Button onClick={fetchUserPosts}>Retry</Button>
              </CardContent>
            </Card>
          )}

          {/* Posts Grid */}
          <div>
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-6xl mb-4 opacity-50">📝</div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    No {activeTab} posts yet
                  </h3>
                  <p className="text-text-secondary mb-4">
                    {activeTab === 'draft' && "Start writing your first post and share your ideas with the community."}
                    {activeTab === 'published' && "Publish your drafts to make them visible to everyone."}
                    {activeTab === 'archived' && "Archived posts will appear here."}
                  </p>
                  {activeTab === 'draft' && (
                    <Button onClick={handleCreatePost} disabled={creatingPost}>
                      <Plus className="w-4 h-4 mr-2" />
                      {creatingPost ? 'Creating...' : 'Create Your First Post'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default UserPostsPage