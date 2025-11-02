'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Badge } from '@/components/Badge'
import { Loading } from '@/components/Loading'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/components/Toast'
import { useConfirm } from '@/components/ConfirmDialog'
import { POST_CATEGORIES } from '@/lib/constants'
import { Post } from '@/types/database'
import {
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Filter,
  TrendingUp,
  Lightbulb,
  Award,
  Users,
  BookOpen,
  ThumbsUp,
  Clock
} from 'lucide-react'

interface PostWithAuthor extends Post {
  author?: {
    id: string
    username: string
    full_name: string
    avatar_url: string | null
  }
}

const categories = [
  { id: 'all', name: 'All Categories', icon: BookOpen },
  { id: 'News', name: 'News', icon: TrendingUp },
  { id: 'You may want to know', name: 'Do You Know?', icon: Lightbulb },
  { id: 'Member Spotlight', name: 'Member Spotlight', icon: Award },
  { id: 'Community Activities', name: 'Community Activities', icon: Users }
]

const statuses = [
  { id: 'all', name: 'All Status', color: 'text-text-secondary' },
  { id: 'draft', name: 'Draft', color: 'text-text-tertiary' },
  { id: 'published', name: 'Published', color: 'text-success' },
  { id: 'archived', name: 'Archived', color: 'text-warning' }
]

export default function AdminPostsPage() {
  const router = useRouter()
  const { session, profile, isAdmin } = useAuth()
  const { showToast } = useToast()
  const { confirm } = useConfirm()

  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Check if user is admin
  useEffect(() => {
    if (profile && !isAdmin) {
      showToast('error', 'Admin access required')
      router.push('/dashboard')
    }
  }, [profile, isAdmin, router, showToast])

  // Fetch posts
  useEffect(() => {
    if (session?.access_token && isAdmin) {
      fetchPosts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedStatus, selectedCategory, session?.access_token, isAdmin])

  const fetchPosts = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      if (selectedStatus !== 'all') params.set('status', selectedStatus)
      if (selectedCategory !== 'all') params.set('category', selectedCategory)

      const response = await fetch(`/api/admin/posts?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setPosts(data.posts)
      } else {
        showToast('error', data.error || 'Failed to fetch posts')
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      showToast('error', 'Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId: string, postTitle: string) => {
    const confirmed = await confirm({
      title: 'Delete Post',
      message: `Are you sure you want to delete "${postTitle}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    })

    if (!confirmed) return

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        showToast('success', 'Post deleted successfully')
        fetchPosts()
      } else {
        showToast('error', data.error || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      showToast('error', 'Network error occurred')
    }
  }

  if (!profile || !isAdmin) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Loading size="lg" text="Checking permissions..." />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Manage All Posts
              </h1>
              <p className="text-text-secondary">
                View and manage all posts from all members
              </p>
            </div>
            <Link href="/admin">
              <Button variant="secondary" size="sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
              <div className="w-full lg:w-96">
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>

              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
                icon={<Filter className="w-4 h-4" />}
              >
                Filters
              </Button>
            </div>

            {/* Filter Buttons */}
            <div className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <button
                      key={status.id}
                      onClick={() => setSelectedStatus(status.id)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        selectedStatus === status.id
                          ? 'border-primary-blue bg-primary-blue/10 text-primary-blue'
                          : 'border-dark-border hover:border-dark-border/60 text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <span className="text-sm font-medium">{status.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                          selectedCategory === category.id
                            ? 'border-primary-blue bg-primary-blue/10 text-primary-blue'
                            : 'border-dark-border hover:border-dark-border/60 text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{category.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loading size="lg" text="Loading posts..." />
          </div>
        )}

        {/* Posts List */}
        {!loading && (
          <>
            {/* Results Count */}
            <div className="mb-4">
              <p className="text-text-secondary">
                {posts.length} post{posts.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Posts Table */}
            {posts.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-dark-surface/50 border-b border-dark-border">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                            Post
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                            Author
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                            Stats
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-border">
                        {posts.map((post) => (
                          <tr
                            key={post.id}
                            className="hover:bg-dark-surface/30 transition-colors"
                          >
                            {/* Post Info */}
                            <td className="px-6 py-4">
                              <div className="max-w-md">
                                <div className="font-medium text-text-primary line-clamp-1 mb-1">
                                  {post.title}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={
                                      post.category === 'News' ? 'primary' :
                                      post.category === 'You may want to know' ? 'tech' :
                                      post.category === 'Member Spotlight' ? 'success' :
                                      'warning'
                                    }
                                    size="sm"
                                  >
                                    {post.category === 'You may want to know' ? 'Do You Know?' : post.category}
                                  </Badge>
                                  {post.featured && (
                                    <Badge variant="primary" size="sm">
                                      Featured
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Author */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-text-tertiary" />
                                <span className="text-sm text-text-secondary">
                                  {post.author?.full_name || 'Unknown'}
                                </span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4">
                              <Badge
                                variant={
                                  post.status === 'published' ? 'success' :
                                  post.status === 'draft' ? 'secondary' :
                                  'default'
                                }
                                size="sm"
                              >
                                {post.status}
                              </Badge>
                            </td>

                            {/* Stats */}
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1 text-xs text-text-tertiary">
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {post.view_count}
                                </div>
                                <div className="flex items-center gap-1">
                                  <ThumbsUp className="w-3 h-3" />
                                  {post.upvote_count}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {post.reading_time}m
                                </div>
                              </div>
                            </td>

                            {/* Date */}
                            <td className="px-6 py-4">
                              <div className="text-sm text-text-tertiary">
                                {new Date(post.created_at).toLocaleDateString()}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                {post.status === 'published' && (
                                  <Link href={`/posts/${post.slug}`} target="_blank">
                                    <Button variant="ghost" size="sm">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                )}
                                <Link href={`/dashboard/posts/${post.id}/edit`}>
                                  <Button variant="secondary" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(post.id, post.title)}
                                  className="text-error hover:text-error hover:bg-error/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-6xl mb-4 opacity-50">📰</div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    No posts found
                  </h3>
                  <p className="text-text-secondary mb-6">
                    {selectedStatus !== 'all' || selectedCategory !== 'all' || searchTerm
                      ? 'Try adjusting your filters or search criteria.'
                      : 'No posts have been created yet.'}
                  </p>
                  {(selectedStatus !== 'all' || selectedCategory !== 'all' || searchTerm) && (
                    <Button
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedStatus('all')
                        setSelectedCategory('all')
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
    </ProtectedRoute>
  )
}
