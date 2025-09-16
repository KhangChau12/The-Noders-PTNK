'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { NewsPost } from '@/lib/posts'
import {
  Search,
  Calendar,
  User,
  ArrowRight,
  TrendingUp,
  Users,
  Code,
  Lightbulb,
  Award,
  BookOpen,
  Clock,
  Filter,
  Share2
} from 'lucide-react'

const categories = [
  { id: 'all', name: 'All Posts', icon: BookOpen, color: 'text-text-primary' },
  { id: 'announcement', name: 'Announcements', icon: TrendingUp, color: 'text-primary-blue' },
  { id: 'project', name: 'Projects', icon: Code, color: 'text-accent-cyan' },
  { id: 'member-spotlight', name: 'Member Spotlight', icon: Award, color: 'text-success' },
  { id: 'technical', name: 'Technical', icon: Lightbulb, color: 'text-warning' },
  { id: 'event', name: 'Events', icon: Users, color: 'text-accent-purple' }
]

function CategoryBadge({ category }: { category: NewsPost['category'] }) {
  const config = {
    announcement: { label: 'Announcement', variant: 'primary' as const },
    project: { label: 'Project', variant: 'secondary' as const },
    'member-spotlight': { label: 'Member Spotlight', variant: 'success' as const },
    technical: { label: 'Technical', variant: 'tech' as const },
    event: { label: 'Event', variant: 'warning' as const }
  }

  const { label, variant } = config[category]
  return <Badge variant={variant} size="sm">{label}</Badge>
}

function NewsCard({ post, featured = false }: { post: NewsPost; featured?: boolean }) {
  const cardClass = featured
    ? "bg-gradient-to-br from-primary-blue/5 to-accent-cyan/5 border-primary-blue/20"
    : ""

  return (
    <Card variant="interactive" className={`h-full hover-lift ${cardClass}`}>
      <Link href={`/news/${post.id}`}>
        {post.image && (
          <div className="aspect-video relative overflow-hidden rounded-t-lg">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            {featured && (
              <div className="absolute top-4 left-4">
                <Badge variant="primary" size="sm">Featured</Badge>
              </div>
            )}
            <div className="absolute top-4 right-4">
              <CategoryBadge category={post.category} />
            </div>
          </div>
        )}

        <CardContent className="p-2">
          <div className="flex items-center gap-4 text-xs text-text-tertiary mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(post.date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readTime} min read
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {post.author}
            </div>
          </div>

          <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-primary-blue transition-colors">
            {post.title}
          </h3>

          <p className="text-text-secondary text-sm mb-4 line-clamp-3">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" size="sm">
                {tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="secondary" size="sm">
                +{post.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              Read More <ArrowRight className="w-3 h-3 ml-1" />
            </Button>

            <Button variant="ghost" size="sm" className="p-2 h-auto">
              <Share2 className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

export default function NewsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()

        if (searchTerm) {
          params.set('search', searchTerm)
        }
        if (selectedCategory !== 'all') {
          params.set('category', selectedCategory)
        }

        const response = await fetch(`/api/posts?${params.toString()}`)
        const data = await response.json()

        if (data.success) {
          setPosts(data.posts)
          setError(null)
        } else {
          setError(data.error || 'Failed to fetch posts')
        }
      } catch (err) {
        setError('Network error occurred')
        console.error('Error fetching posts:', err)
      } finally {
        setLoading(false)
      }
    }

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(fetchPosts, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCategory])

  const featuredPosts = posts.filter(post => post.featured)
  const regularPosts = posts.filter(post => !post.featured)

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            News & Updates
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Stay updated with the latest announcements, project showcases, member spotlights,
            and insights from the AI Agent Club community.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
            {/* Search */}
            <div className="w-full lg:w-96">
              <Input
                placeholder="Search news and updates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
              icon={<Filter className="w-4 h-4" />}
            >
              Filters
            </Button>
          </div>

          {/* Categories */}
          <div className={`grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-2 ${
            showFilters ? 'block' : 'hidden lg:flex'
          }`}>
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = selectedCategory === category.id

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    isActive
                      ? 'border-primary-blue bg-primary-blue/10 text-primary-blue'
                      : 'border-dark-border hover:border-dark-border/60 text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary-blue' : category.color}`} />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 text-text-secondary">
              <div className="w-4 h-4 border-2 border-primary-blue/30 border-t-primary-blue rounded-full animate-spin" />
              Loading posts...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mb-8">
            <Card className="border-error/20 bg-error/10">
              <CardContent className="p-6 text-center">
                <p className="text-error">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && (
          <div className="mb-6">
            <p className="text-text-secondary">
              {posts.length} post{posts.length !== 1 ? 's' : ''} found
              {selectedCategory !== 'all' && (
                <span> in {categories.find(c => c.id === selectedCategory)?.name}</span>
              )}
            </p>
          </div>
        )}

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-primary-blue" />
              Featured Posts
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <NewsCard key={post.id} post={post} featured />
              ))}
            </div>
          </div>
        )}

        {/* Regular Posts */}
        {regularPosts.length > 0 ? (
          <div className="mb-12">
            {featuredPosts.length > 0 && (
              <h2 className="text-2xl font-bold text-text-primary mb-6">Latest Posts</h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post) => (
                <NewsCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        ) : (!loading && posts.length === 0) ? (
          <Card className="text-center py-12 mb-4">
            <CardContent>
              <div className="text-6xl mb-4 opacity-50">📰</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                No posts found
              </h3>
              <p className="text-text-secondary mb-6">
                Try adjusting your search criteria or filters.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {/* Newsletter Signup */}
        <Card className="bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20">
          <CardContent className="text-center p-8">
            <h3 className="text-2xl font-bold text-text-primary mb-4">
              Stay In The Loop
            </h3>
            <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
              Get the latest news, project updates, and insights delivered directly to your inbox.
              Be the first to know about our newest developments and opportunities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="your.email@example.com"
                className="flex-1"
              />
              <Button>
                Subscribe
              </Button>
            </div>

            <p className="text-text-tertiary text-sm mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}