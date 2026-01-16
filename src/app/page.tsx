import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { CounterAnimation } from '@/components/CounterAnimation'
import { SITE_CONFIG } from '@/lib/constants'
import { generateMetadata as generateSEOMetadata, generateOrganizationSchema } from '@/lib/seo'
import { Code, Users, Zap, Brain, ArrowRight, Github, ExternalLink, Calendar, Clock, User, Newspaper, Target, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { TECH_STACK_COLORS } from '@/lib/constants'

interface Stats {
  activeProjects: number
  activeMembers: number
  postsShared: number
  totalViews: number
  competitionsHeld: number
}

interface Project {
  id: string
  title: string
  description: string
  tech_stack: string[]
  status: string
  repo_url?: string
  demo_url?: string
  thumbnail_url?: string
  created_at: string
  contributors: any[]
  created_by_profile?: {
    username: string
    full_name: string
    avatar_url?: string
  }
  thumbnail_image?: {
    id: string
    filename: string
    public_url: string
    width: number
    height: number
    alt_text?: string
  }
}

interface NewsPost {
  id: string
  title: string
  summary: string
  slug: string
  category: string
  reading_time: number
  published_at: string
  author?: {
    username: string
    full_name: string
  }
  thumbnail_image?: {
    id: string
    filename: string
    public_url: string
    width: number
    height: number
    alt_text?: string
  }
}

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

// SEO Metadata
export const metadata = generateSEOMetadata({
  title: 'Home',
  description: SITE_CONFIG.description,
  keywords: ['AI workshops', 'student tech community', 'PTNK projects', 'high school developers'],
  url: '/',
})

// Fetch stats from database
async function getStats(): Promise<Stats> {
  try {
    const supabase = createClient()

    // Get projects count
    const { count: projectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get members count
    const { count: membersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Get published posts count
    const { count: postsCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    // Get total views from all published posts
    const { data: postsData } = await supabase
      .from('posts')
      .select('view_count')
      .eq('status', 'published')

    const totalViews = postsData?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0

    // For competitions, we have NAIC 2025 and PAIC 2026
    const competitionsCount = 2

    return {
      activeProjects: projectsCount || 0,
      activeMembers: membersCount || 0,
      postsShared: postsCount || 0,
      totalViews: totalViews,
      competitionsHeld: competitionsCount
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    // Fallback to default values
    return {
      activeProjects: 8,
      activeMembers: 15,
      postsShared: 25,
      totalViews: 0,
      competitionsHeld: 2
    }
  }
}

// Fetch recent projects from database
async function getRecentProjects(): Promise<Project[]> {
  try {
    const supabase = createClient()

    // Get featured projects (up to 3) with contributors and creator info
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        created_by_profile:profiles!created_by(
          username,
          full_name,
          avatar_url
        ),
        project_contributors(
          id,
          contribution_percentage,
          role_in_project,
          profiles(
            id,
            username,
            full_name,
            avatar_url
          )
        ),
        thumbnail_image:images(
          id,
          public_url,
          alt_text
        )
      `)
      .eq('featured', true)
      .in('status', ['active', 'completed'])
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('Error fetching recent projects:', error)
      return []
    }

    // Transform the data to match the expected format
    return projects?.map((project: any) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      tech_stack: project.tech_stack || [],
      status: project.status,
      repo_url: project.repo_url,
      demo_url: project.demo_url,
      thumbnail_url: project.thumbnail_url,
      created_at: project.created_at,
      contributors: project.project_contributors || [],
      created_by_profile: project.created_by_profile,
      thumbnail_image: project.thumbnail_image
    })) || []
  } catch (error) {
    console.error('Failed to fetch recent projects:', error)
    return []
  }
}

// Fetch recent posts from database
async function getRecentPosts(): Promise<NewsPost[]> {
  try {
    const supabase = createClient()

    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        ),
        thumbnail_image:images!posts_thumbnail_image_id_fkey(
          id,
          filename,
          public_url,
          width,
          height,
          alt_text
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(2)

    if (error) {
      console.error('Error fetching recent posts:', error)
      return []
    }

    return posts || []
  } catch (error) {
    console.error('Failed to fetch recent posts:', error)
    return []
  }
}

// Helper function to get initials
function getInitials(name?: string): string {
  if (!name) return '?'
  const words = name.trim().split(' ')
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

export default async function HomePage() {
  // Fetch all data in parallel
  const [stats, recentProjects, recentPosts] = await Promise.all([
    getStats(),
    getRecentProjects(),
    getRecentPosts()
  ])

  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Contest',
      description: 'Compete and learn through hands-on AI challenges',
      href: '/contest'
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Education',
      description: 'Structured workshops and courses for skill development',
      href: '/education'
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: 'Projects',
      description: 'Real-world tech solutions built by our members',
      href: '/projects'
    },
    {
      icon: <Newspaper className="w-8 h-8" />,
      title: 'Posts',
      description: 'Insights and knowledge shared by the community',
      href: '/posts'
    }
  ]

  const statsData = [
    { label: 'Active Projects', value: stats.activeProjects, key: 'activeProjects' },
    { label: 'Active Members', value: stats.activeMembers, key: 'activeMembers' },
    { label: 'Competitions Held', value: stats.competitionsHeld, key: 'competitionsHeld' },
    { label: 'Posts Shared', value: stats.postsShared, key: 'postsShared' },
    { label: 'Total Views', value: stats.totalViews, key: 'totalViews' }
  ]

  // Helper function to get project status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success'
      case 'archived':
        return 'default'
      default:
        return 'warning'
    }
  }

  // Helper function to get post category display name
  const getCategoryDisplayName = (category: string) => {
    if (category === 'You may want to know') {
      return 'Do You Know?'
    }
    return category
  }

  // Helper function to get post category badge variant
  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'News':
        return 'primary'
      case 'You may want to know':
        return 'secondary'
      case 'Member Spotlight':
        return 'success'
      case 'Community Activities':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateOrganizationSchema())
        }}
      />

      <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Decorations - Neural Network Pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Left Network */}
          <svg className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] md:w-[700px] md:h-[700px] opacity-30 md:opacity-40 animate-pulse" style={{ animationDuration: '8s' }}>
            <defs>
              <filter id="glow-left">
                <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="node-glow-left">
                <feGaussianBlur stdDeviation="25" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <radialGradient id="node-gradient-left">
                <stop offset="0%" stopColor="rgba(96, 165, 250, 0.6)" />
                <stop offset="30%" stopColor="rgba(96, 165, 250, 0.3)" />
                <stop offset="60%" stopColor="rgba(59, 130, 246, 0.1)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
              </radialGradient>
            </defs>

            {/* Cluster 1: Top-left area */}
            <line x1="120" y1="80" x2="200" y2="120" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" filter="url(#glow-left)" />
            <line x1="200" y1="120" x2="280" y2="100" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" filter="url(#glow-left)" />
            <line x1="120" y1="80" x2="180" y2="180" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="1.5" filter="url(#glow-left)" />

            {/* Cluster 2: Middle-left area */}
            <line x1="80" y1="250" x2="180" y2="180" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" filter="url(#glow-left)" />
            <line x1="80" y1="250" x2="160" y2="320" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" filter="url(#glow-left)" />
            <line x1="180" y1="180" x2="280" y2="250" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="1.5" filter="url(#glow-left)" />

            {/* Cluster 3: Center area */}
            <line x1="280" y1="250" x2="380" y2="220" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" filter="url(#glow-left)" />
            <line x1="280" y1="250" x2="360" y2="340" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" filter="url(#glow-left)" />
            <line x1="200" y1="120" x2="280" y2="250" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1.5" filter="url(#glow-left)" />
            <line x1="380" y1="220" x2="280" y2="100" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="1.5" filter="url(#glow-left)" />

            {/* Cluster 4: Bottom area */}
            <line x1="160" y1="320" x2="240" y2="420" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" filter="url(#glow-left)" />
            <line x1="240" y1="420" x2="360" y2="340" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" filter="url(#glow-left)" />
            <line x1="360" y1="340" x2="460" y2="380" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="1.5" filter="url(#glow-left)" />

            {/* Inter-cluster connections */}
            <line x1="380" y1="220" x2="460" y2="380" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" filter="url(#glow-left)" />
            <line x1="160" y1="320" x2="280" y2="250" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1.5" filter="url(#glow-left)" />

            {/* Node glows (background) */}
            <circle cx="120" cy="80" r="40" fill="url(#node-gradient-left)" opacity="0.5" filter="url(#node-glow-left)" />
            <circle cx="200" cy="120" r="50" fill="url(#node-gradient-left)" opacity="0.6" filter="url(#node-glow-left)" />
            <circle cx="280" cy="100" r="40" fill="url(#node-gradient-left)" opacity="0.5" filter="url(#node-glow-left)" />
            <circle cx="80" cy="250" r="40" fill="url(#node-gradient-left)" opacity="0.5" filter="url(#node-glow-left)" />
            <circle cx="180" cy="180" r="50" fill="url(#node-gradient-left)" opacity="0.6" filter="url(#node-glow-left)" />
            <circle cx="160" cy="320" r="40" fill="url(#node-gradient-left)" opacity="0.5" filter="url(#node-glow-left)" />
            <circle cx="280" cy="250" r="60" fill="url(#node-gradient-left)" opacity="0.7" filter="url(#node-glow-left)" />
            <circle cx="380" cy="220" r="50" fill="url(#node-gradient-left)" opacity="0.6" filter="url(#node-glow-left)" />
            <circle cx="240" cy="420" r="50" fill="url(#node-gradient-left)" opacity="0.6" filter="url(#node-glow-left)" />
            <circle cx="360" cy="340" r="50" fill="url(#node-gradient-left)" opacity="0.6" filter="url(#node-glow-left)" />
            <circle cx="460" cy="380" r="40" fill="url(#node-gradient-left)" opacity="0.5" filter="url(#node-glow-left)" />

            {/* Nodes (foreground) */}
            <circle cx="120" cy="80" r="5" fill="rgba(96, 165, 250, 1)" filter="url(#glow-left)" />
            <circle cx="200" cy="120" r="6" fill="rgba(59, 130, 246, 1)" filter="url(#glow-left)" />
            <circle cx="280" cy="100" r="5" fill="rgba(96, 165, 250, 1)" filter="url(#glow-left)" />
            <circle cx="80" cy="250" r="5" fill="rgba(96, 165, 250, 1)" filter="url(#glow-left)" />
            <circle cx="180" cy="180" r="6" fill="rgba(59, 130, 246, 1)" filter="url(#glow-left)" />
            <circle cx="160" cy="320" r="5" fill="rgba(96, 165, 250, 1)" filter="url(#glow-left)" />
            <circle cx="280" cy="250" r="7" fill="rgba(59, 130, 246, 1)" filter="url(#glow-left)" />
            <circle cx="380" cy="220" r="6" fill="rgba(59, 130, 246, 1)" filter="url(#glow-left)" />
            <circle cx="240" cy="420" r="6" fill="rgba(59, 130, 246, 1)" filter="url(#glow-left)" />
            <circle cx="360" cy="340" r="6" fill="rgba(59, 130, 246, 1)" filter="url(#glow-left)" />
            <circle cx="460" cy="380" r="5" fill="rgba(96, 165, 250, 1)" filter="url(#glow-left)" />
          </svg>

          {/* Right Network */}
          <svg className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[400px] h-[400px] md:w-[700px] md:h-[700px] opacity-30 md:opacity-40 animate-pulse" style={{ animationDuration: '8s', animationDelay: '4s' }}>
            <defs>
              <filter id="glow-right">
                <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="node-glow-right">
                <feGaussianBlur stdDeviation="25" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <radialGradient id="node-gradient-right">
                <stop offset="0%" stopColor="rgba(96, 165, 250, 0.6)" />
                <stop offset="30%" stopColor="rgba(96, 165, 250, 0.3)" />
                <stop offset="60%" stopColor="rgba(59, 130, 246, 0.1)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
              </radialGradient>
            </defs>

            {/* Cluster 1: Top-right area */}
            <line x1="480" y1="80" x2="400" y2="120" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" filter="url(#glow-right)" />
            <line x1="400" y1="120" x2="320" y2="100" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" filter="url(#glow-right)" />
            <line x1="480" y1="80" x2="420" y2="180" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="1.5" filter="url(#glow-right)" />

            {/* Cluster 2: Middle-right area */}
            <line x1="520" y1="250" x2="420" y2="180" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" filter="url(#glow-right)" />
            <line x1="520" y1="250" x2="440" y2="320" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" filter="url(#glow-right)" />
            <line x1="420" y1="180" x2="320" y2="250" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="1.5" filter="url(#glow-right)" />

            {/* Cluster 3: Center area */}
            <line x1="320" y1="250" x2="220" y2="220" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" filter="url(#glow-right)" />
            <line x1="320" y1="250" x2="240" y2="340" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" filter="url(#glow-right)" />
            <line x1="400" y1="120" x2="320" y2="250" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1.5" filter="url(#glow-right)" />
            <line x1="220" y1="220" x2="320" y2="100" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="1.5" filter="url(#glow-right)" />

            {/* Cluster 4: Bottom area */}
            <line x1="440" y1="320" x2="360" y2="420" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" filter="url(#glow-right)" />
            <line x1="360" y1="420" x2="240" y2="340" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" filter="url(#glow-right)" />
            <line x1="240" y1="340" x2="140" y2="380" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="1.5" filter="url(#glow-right)" />

            {/* Inter-cluster connections */}
            <line x1="220" y1="220" x2="140" y2="380" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" filter="url(#glow-right)" />
            <line x1="440" y1="320" x2="320" y2="250" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1.5" filter="url(#glow-right)" />

            {/* Node glows (background) */}
            <circle cx="480" cy="80" r="40" fill="url(#node-gradient-right)" opacity="0.5" filter="url(#node-glow-right)" />
            <circle cx="400" cy="120" r="50" fill="url(#node-gradient-right)" opacity="0.6" filter="url(#node-glow-right)" />
            <circle cx="320" cy="100" r="40" fill="url(#node-gradient-right)" opacity="0.5" filter="url(#node-glow-right)" />
            <circle cx="520" cy="250" r="40" fill="url(#node-gradient-right)" opacity="0.5" filter="url(#node-glow-right)" />
            <circle cx="420" cy="180" r="50" fill="url(#node-gradient-right)" opacity="0.6" filter="url(#node-glow-right)" />
            <circle cx="440" cy="320" r="40" fill="url(#node-gradient-right)" opacity="0.5" filter="url(#node-glow-right)" />
            <circle cx="320" cy="250" r="60" fill="url(#node-gradient-right)" opacity="0.7" filter="url(#node-glow-right)" />
            <circle cx="220" cy="220" r="50" fill="url(#node-gradient-right)" opacity="0.6" filter="url(#node-glow-right)" />
            <circle cx="360" cy="420" r="50" fill="url(#node-gradient-right)" opacity="0.6" filter="url(#node-glow-right)" />
            <circle cx="240" cy="340" r="50" fill="url(#node-gradient-right)" opacity="0.6" filter="url(#node-glow-right)" />
            <circle cx="140" cy="380" r="40" fill="url(#node-gradient-right)" opacity="0.5" filter="url(#node-glow-right)" />

            {/* Nodes (foreground) */}
            <circle cx="480" cy="80" r="5" fill="rgba(96, 165, 250, 1)" filter="url(#glow-right)" />
            <circle cx="400" cy="120" r="6" fill="rgba(59, 130, 246, 1)" filter="url(#glow-right)" />
            <circle cx="320" cy="100" r="5" fill="rgba(96, 165, 250, 1)" filter="url(#glow-right)" />
            <circle cx="520" cy="250" r="5" fill="rgba(96, 165, 250, 1)" filter="url(#glow-right)" />
            <circle cx="420" cy="180" r="6" fill="rgba(59, 130, 246, 1)" filter="url(#glow-right)" />
            <circle cx="440" cy="320" r="5" fill="rgba(96, 165, 250, 1)" filter="url(#glow-right)" />
            <circle cx="320" cy="250" r="7" fill="rgba(59, 130, 246, 1)" filter="url(#glow-right)" />
            <circle cx="220" cy="220" r="6" fill="rgba(59, 130, 246, 1)" filter="url(#glow-right)" />
            <circle cx="360" cy="420" r="6" fill="rgba(59, 130, 246, 1)" filter="url(#glow-right)" />
            <circle cx="240" cy="340" r="6" fill="rgba(59, 130, 246, 1)" filter="url(#glow-right)" />
            <circle cx="140" cy="380" r="5" fill="rgba(96, 165, 250, 1)" filter="url(#glow-right)" />
          </svg>

          {/* Center Glow Background */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[1200px] md:h-[1200px] opacity-20 md:opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(96, 165, 250, 0.5) 0%, rgba(59, 130, 246, 0.3) 40%, transparent 70%)',
              filter: 'blur(100px)'
            }}
          />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-[family-name:var(--font-shrikhand)] mb-4">
              <span className="gradient-text">
                THE NODERS PTNK
              </span>
            </h1>

            <p className="text-lg text-text-secondary mb-3">
              Technology Community with students from PTNK
            </p>

            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-text-primary">
              Connecting Minds • Creating Intelligence
            </h2>

            <p className="text-lg text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
              Where innovation meets collaboration at VNUHCM High School for the Gifted.
              Just like nodes in a neural network collaborate to create powerful intelligence, we connect to build an outstanding developer community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contest">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary-blue to-accent-cyan hover:from-primary-blue/90 hover:to-accent-cyan/90">
                  Join AI Challenge 2026
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/projects">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Explore Projects
                  <Code className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/members">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Meet the Team
                  <Users className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Event Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Our Latest Event
            </h2>
            <p className="text-text-secondary text-lg max-w-3xl mx-auto">
              Check out the highlights from our recent workshop and competition kickoff
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Card className="overflow-hidden bg-gradient-to-br from-dark-surface to-dark-bg border-primary-blue/30">
              <CardContent className="p-0">
                <div className="relative aspect-video w-full">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src="https://www.youtube.com/embed/cFs5njLot7k"
                    title="The Noders PTNK Latest Event"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-6 bg-gradient-to-br from-primary-blue/10 to-accent-cyan/10">
                  <h3 className="text-xl font-bold text-text-primary mb-2">
                    PAIC 2026 Workshop & Registration
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    Join us as we kick off PTNK AI Challenge 2026 with an exciting workshop session,
                    covering competition details, guidelines, and hands-on demonstrations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section - Our Journey So Far */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-surface/20 to-dark-bg" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />

        <div className="container mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Our Journey So Far
            </h2>
            <p className="text-text-secondary text-lg max-w-3xl mx-auto leading-relaxed">
              From innovative projects to growing community, here's what we've achieved together
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {statsData.map((stat, index) => (
              <div key={stat.key} className="group relative">
                <div className="relative h-full bg-gradient-to-br from-dark-surface to-dark-surface/50 border border-dark-border rounded-xl p-8 transition-all duration-500 hover:border-primary-blue/50 hover:shadow-2xl hover:shadow-primary-blue/20 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-blue/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="absolute top-4 left-4 text-4xl font-bold text-primary-blue/10 group-hover:text-primary-blue/20 transition-colors duration-500">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="relative z-10 text-center pt-8">
                    <div className="text-3xl md:text-4xl font-bold mb-3 text-primary-blue">
                      <CounterAnimation end={stat.value} />
                    </div>

                    <div className="text-text-secondary text-sm md:text-base font-medium">
                      {stat.label}
                    </div>

                    <div className="mt-6 h-1 bg-dark-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-blue to-accent-cyan rounded-full animate-fill-bar"
                        style={{
                          animationDelay: `${index * 0.2}s`
                        }}
                      />
                    </div>
                  </div>

                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-blue/0 to-accent-cyan/0 group-hover:from-primary-blue/5 group-hover:to-accent-cyan/5 transition-all duration-500 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              What We Do
            </h2>
            <p className="text-text-secondary text-lg max-w-3xl mx-auto">
              Our club focuses on hands-on learning, collaboration, and innovation in the AI space.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <Card className="text-center hover-lift group relative overflow-hidden cursor-pointer h-full transition-all duration-300">
                  <CardContent className="p-8 relative z-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/10 border border-primary-blue/30 rounded-2xl mb-6 text-primary-blue group-hover:shadow-2xl group-hover:shadow-primary-blue/30 group-hover:scale-110 transition-all duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary mb-4 group-hover:bg-gradient-to-r group-hover:from-primary-blue group-hover:to-accent-cyan group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed text-base min-h-[3rem]">
                      {feature.description}
                    </p>
                  </CardContent>
                  {/* Animated border on hover */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-blue/50 rounded-lg transition-all duration-300"></div>
                  {/* Gradient glow background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/0 to-accent-cyan/0 group-hover:from-primary-blue/10 group-hover:to-accent-cyan/10 transition-all duration-500 rounded-lg"></div>
                  {/* Arrow indicator on bottom right */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="w-5 h-5 text-primary-blue" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Our Contests Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Our Contests
            </h2>
            <p className="text-text-secondary text-lg max-w-3xl mx-auto">
              Challenge yourself and level up your AI skills through real competition
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* PAIC 2026 Card */}
            <Card variant="hover" className="hover-lift group bg-gradient-to-br from-accent-cyan/10 to-primary-blue/10 border border-accent-cyan/30">
              <CardContent className="p-8">
                <Badge variant="success" className="mb-4">Public • Ongoing</Badge>
                <h3 className="text-2xl font-bold text-text-primary mb-3 group-hover:text-accent-cyan transition-colors">
                  PTNK AI Challenge 2026
                </h3>
                <p className="text-text-secondary mb-6 leading-relaxed">
                  Our flagship public competition for VNU High School students. Build IELTS scoring models and compete for cash prizes up to 1,000,000 VNĐ.
                </p>
                <div className="flex items-center gap-4 mb-6 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent-cyan" />
                    <span>24 Teams • 54 Participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent-cyan" />
                    <span>05 - 18 Jan 2026</span>
                  </div>
                </div>
                <Link href="/contest/paic-2026">
                  <Button variant="secondary" className="w-full group/btn">
                    Learn More
                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* NAIC 2025 Card */}
            <Card variant="hover" className="hover-lift group bg-gradient-to-br from-primary-blue/10 to-accent-cyan/10 border border-primary-blue/30">
              <CardContent className="p-8">
                <Badge variant="primary" className="mb-4">Internal • Ended</Badge>
                <h3 className="text-2xl font-bold text-text-primary mb-3 group-hover:text-primary-blue transition-colors">
                  Noders AI Competition 2025
                </h3>
                <p className="text-text-secondary mb-6 leading-relaxed">
                  Our internal training ground where members sharpen AI skills through hands-on IELTS scoring challenges. Practice, compete, and earn rewards.
                </p>
                <div className="flex items-center gap-4 mb-6 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary-blue" />
                    <span>16 Participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-blue" />
                    <span>29 Nov - 28 Dec</span>
                  </div>
                </div>
                <Link href="/contest/naic-2025">
                  <Button variant="secondary" className="w-full group/btn">
                    View Results
                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link href="/contest">
              <Button size="lg" className="group">
                View All Contests
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Courses & Workshops
            </h2>
            <p className="text-text-secondary text-lg max-w-3xl mx-auto">
              Structured learning paths and hands-on workshops to build your AI and Data Science skills
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Data Science Module 1 Card */}
            <Card variant="hover" className="hover-lift group bg-gradient-to-br from-primary-blue/10 to-accent-cyan/10 border border-primary-blue/30">
              <CardContent className="p-8">
                <Badge variant="warning" className="mb-4">Mini-Course • Coming Soon</Badge>
                <h3 className="text-2xl font-bold text-text-primary mb-3 group-hover:text-primary-blue transition-colors">
                  Introduction to Data Science - Module 1
                </h3>
                <p className="text-text-secondary mb-6 leading-relaxed">
                  Build a solid foundation in data science thinking and gain comprehensive knowledge of the 3 pillars of data (Structured, Vision, NLP).
                  4-session mini-course focused on problem fundamentals and practical applications.
                </p>
                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary-blue" />
                    <span>Grade 10-11 Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-blue" />
                    <span>4 sessions × 1.5h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-blue" />
                    <span>January 2026</span>
                  </div>
                </div>
                <Link href="/education/data-science-module-1">
                  <Button variant="secondary" className="w-full group/btn">
                    Learn More
                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link href="/education">
              <Button size="lg" className="group">
                View All Programs
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Projects Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Recent Projects
            </h2>
            <p className="text-text-secondary text-lg max-w-3xl mx-auto">
              Check out some of our latest innovations and collaborative efforts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {recentProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="block group">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-surface/90 to-dark-bg/90 border-2 border-dark-border/50 hover:border-primary-blue/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-blue/20 h-full flex flex-col backdrop-blur-sm hover:-translate-y-2">

                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/0 via-accent-cyan/0 to-purple-500/0 group-hover:from-primary-blue/5 group-hover:via-accent-cyan/5 group-hover:to-purple-500/5 transition-all duration-700 pointer-events-none" />

                  {/* Thumbnail with glassmorphism overlay */}
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary-blue/10 via-accent-cyan/10 to-purple-500/10">
                    {project.thumbnail_image?.public_url || project.thumbnail_url ? (
                      <Image
                        src={(project.thumbnail_image?.public_url || project.thumbnail_url) as string}
                        alt={project.thumbnail_image?.alt_text || project.title}
                        fill
                        className="object-cover"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-blue/20 to-accent-cyan/10">
                        <div className="text-center relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/40 to-accent-cyan/40 blur-2xl group-hover:blur-3xl animate-pulse" />
                          <Code className="w-20 h-20 text-primary-blue/50 mx-auto mb-2 relative z-10" />
                          <p className="text-sm text-text-tertiary font-semibold bg-gradient-to-r from-primary-blue to-accent-cyan bg-clip-text text-transparent relative z-10">No Preview</p>
                        </div>
                      </div>
                    )}

                    {/* Subtle blue gradient overlay - more transparent */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/20 via-accent-cyan/5 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-500" />

                    {/* Status badge with glow */}
                    <div className="absolute top-4 right-4 z-10">
                      <Badge
                        variant={getStatusVariant(project.status)}
                        size="sm"
                        className="backdrop-blur-xl bg-dark-bg/80 font-bold text-xs shadow-xl border border-white/10"
                      >
                        {project.status}
                      </Badge>
                    </div>

                    {/* Quick action buttons on hover */}
                    <div className="absolute bottom-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      {project.repo_url && (
                        <div className="p-2 rounded-lg bg-dark-bg/90 backdrop-blur-md border border-primary-blue/30 shadow-lg hover:scale-110 transition-transform duration-200">
                          <Github className="w-4 h-4 text-primary-blue" />
                        </div>
                      )}
                      {project.demo_url && (
                        <div className="p-2 rounded-lg bg-dark-bg/90 backdrop-blur-md border border-accent-cyan/30 shadow-lg hover:scale-110 transition-transform duration-200">
                          <ExternalLink className="w-4 h-4 text-accent-cyan" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content section */}
                  <div className="p-6 flex-1 flex flex-col relative z-10">
                    {/* Title with gradient hover effect */}
                    <h3 className="text-2xl font-bold text-text-primary mb-3 group-hover:bg-gradient-to-r group-hover:from-primary-blue group-hover:to-accent-cyan group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 line-clamp-2 leading-tight">
                      {project.title}
                    </h3>

                    {/* Description */}
                    {project.description && (
                      <p className="text-text-secondary/90 mb-4 line-clamp-2 leading-relaxed text-sm">
                        {project.description}
                      </p>
                    )}

                    {/* Tech Stack */}
                    {project.tech_stack && project.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tech_stack.slice(0, 5).map((tech) => {
                          const techColor = TECH_STACK_COLORS[tech] || '#6B7280'
                          return (
                            <div
                              key={tech}
                              className="relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 hover:scale-110 cursor-default group/tech"
                              style={{
                                backgroundColor: `${techColor}20`,
                                color: techColor,
                                border: `1.5px solid ${techColor}35`,
                              }}
                            >
                              <div
                                className="absolute inset-0 rounded-lg opacity-0 group-hover/tech:opacity-100 transition-opacity duration-300"
                                style={{
                                  boxShadow: `0 0 20px ${techColor}40`,
                                }}
                              />
                              <span className="relative z-10">{tech}</span>
                            </div>
                          )
                        })}
                        {project.tech_stack.length > 5 && (
                          <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-dark-border/50 text-text-secondary border border-dark-border">
                            +{project.tech_stack.length - 5}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Contributors section - improved */}
                    {project.contributors && project.contributors.length > 0 && (
                      <div className="mt-auto pt-4 border-t border-dark-border/60 group-hover:border-primary-blue/30 transition-colors duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {/* Avatars */}
                            <div className="flex -space-x-3">
                              {project.contributors.slice(0, 4).map((contributor, idx) => {
                                const profile = contributor.profiles || contributor.profile
                                const initial = getInitials(profile?.full_name || profile?.username)
                                const colors = ['from-primary-blue to-accent-cyan', 'from-accent-cyan to-purple-500', 'from-purple-500 to-pink-500', 'from-pink-500 to-primary-blue']
                                return (
                                  <div
                                    key={contributor.id || idx}
                                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[idx % colors.length]} p-0.5 ring-2 ring-dark-bg transition-all duration-300 group-hover:scale-110 shadow-lg`}
                                    title={`${profile?.full_name || profile?.username} - ${contributor.contribution_percentage}%`}
                                    style={{ zIndex: 4 - idx }}
                                  >
                                    <div className="w-full h-full bg-dark-surface rounded-full flex items-center justify-center text-xs text-white font-bold">
                                      {initial}
                                    </div>
                                  </div>
                                )
                              })}
                              {project.contributors.length > 4 && (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dark-border to-dark-surface flex items-center justify-center text-xs text-text-secondary font-bold ring-2 ring-dark-bg shadow-lg">
                                  +{project.contributors.length - 4}
                                </div>
                              )}
                            </div>

                            {/* Team count */}
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Team</span>
                              <span className="text-sm font-bold text-primary-blue">{project.contributors.length} {project.contributors.length === 1 ? 'Member' : 'Members'}</span>
                            </div>
                          </div>

                          {/* View arrow */}
                          <div className="text-primary-blue opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        </div>

                        {/* Created date */}
                        <div className="flex items-center gap-2 mt-3 text-xs text-text-tertiary">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Created {formatDate(project.created_at)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hover border glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: '0 0 30px rgba(59, 130, 246, 0.3), inset 0 0 30px rgba(6, 182, 212, 0.1)' }} />
                </div>
              </Link>
            ))}
          </div>

          {recentProjects.length >= 1 && (
            <div className="text-center mt-12">
              <Link href="/projects">
                <Button variant="secondary" size="lg" className="group">
                  View All Projects
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-surface/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Latest News & Updates
            </h2>
            <p className="text-text-secondary max-w-3xl mx-auto">
              Stay up to date with our latest announcements, project showcases, and community highlights.
            </p>
          </div>

          <div className={`grid gap-8 mb-8 ${recentPosts.length === 1 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {recentPosts.map((post) => (
              <Card key={post.id} variant="interactive" className="hover-lift group">
                <Link href={`/posts/${post.slug}`}>
                  <div className="aspect-video relative rounded-t-lg overflow-hidden bg-gradient-to-br from-primary-blue/10 to-accent-cyan/5">
                    {post.thumbnail_image?.public_url ? (
                      <Image
                        src={post.thumbnail_image.public_url as string}
                        alt={post.thumbnail_image.alt_text || post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Newspaper className="w-12 h-12 text-primary-blue group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardContent className="pt-4">
                    <Badge variant={getCategoryBadgeVariant(post.category) as any} size="sm" className="mb-3">
                      {getCategoryDisplayName(post.category)}
                    </Badge>
                    <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-primary-blue transition-colors">
                      {post.title || 'Untitled Post'}
                    </h3>
                    <p className="text-text-secondary text-sm mb-4 line-clamp-2 leading-relaxed">
                      {post.summary || 'No summary available'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-text-tertiary mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.published_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.reading_time} min read
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-primary-blue text-sm font-medium">Read More</span>
                      <ArrowRight className="w-4 h-4 text-primary-blue group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}

            {/* View all posts CTA */}
            <Card variant="interactive" className="hover-lift group">
              <Link href="/posts">
                <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-primary-blue/25 transition-all duration-300">
                    <Newspaper className="w-8 h-8 text-primary-blue" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    View All Posts
                  </h3>
                  <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                    Discover more stories, updates, and insights from our community
                  </p>
                  <div className="flex items-center justify-center gap-2 text-primary-blue group-hover:text-accent-cyan transition-colors duration-300">
                    <span className="text-sm font-medium">Browse All Posts</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Card className="text-center bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Join The Noders Community
              </h2>
              <p className="text-text-secondary text-lg mb-8 max-w-3xl mx-auto">
                Passionate about AI, web/app development, or technology in general?
                Join us in connecting to create amazing things together!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/members">
                  <Button size="lg" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
    </>
  )
}
