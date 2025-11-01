import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { CounterAnimation } from '@/components/CounterAnimation'
import { SITE_CONFIG } from '@/lib/constants'
import { generateMetadata as generateSEOMetadata, generateOrganizationSchema } from '@/lib/seo'
import { Code, Users, Zap, Brain, ArrowRight, Github, ExternalLink, Calendar, Clock, User, Newspaper } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface Stats {
  activeProjects: number
  activeMembers: number
  postsShared: number
  workshopsHeld: number
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

    // For workshops, we'll set to 1 as requested
    const workshopsCount = 1

    return {
      activeProjects: projectsCount || 0,
      activeMembers: membersCount || 0,
      postsShared: postsCount || 0,
      workshopsHeld: workshopsCount
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    // Fallback to default values
    return {
      activeProjects: 8,
      activeMembers: 15,
      postsShared: 25,
      workshopsHeld: 1
    }
  }
}

// Fetch recent projects from database
async function getRecentProjects(): Promise<Project[]> {
  try {
    const supabase = createClient()

    // Get recent projects with contributors and creator info
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        created_by_profile:profiles!projects_created_by_fkey(
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
      .in('status', ['active', 'completed'])
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('Error fetching recent projects:', error)
      return []
    }

    // Transform the data to match the expected format
    return projects?.map(project => ({
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

export default async function HomePage() {
  // Fetch all data in parallel
  const [stats, recentProjects, recentPosts] = await Promise.all([
    getStats(),
    getRecentProjects(),
    getRecentPosts()
  ])

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI Innovation & Workshops',
      description: 'Organizing workshops at our school to spread AI and technology knowledge to more students.'
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: 'Practical Tech Solutions',
      description: 'Building practical technology products, especially AI tools to support student learning.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Knowledge Sharing',
      description: 'Writing and sharing tech posts for the community to learn, explore and share together.'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Community Building',
      description: 'Connecting young developers at PTNK into a strong learning and development community.'
    }
  ]

  const statsDisplay = [
    { label: 'Active Projects', value: stats.activeProjects, key: 'activeProjects' },
    { label: 'Active Members', value: stats.activeMembers, key: 'activeMembers' },
    { label: 'Posts Shared', value: stats.postsShared, key: 'postsShared' },
    { label: 'Workshops Held', value: stats.workshopsHeld, key: 'workshopsHeld' }
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
      return 'Did You Know?'
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
              Technology Club at PTNK
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
                  Join AI Challenge 2025
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

      {/* Stats Section - Our Journey So Far */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-dark-surface/40 to-primary-blue/5 relative">
        <div className="container mx-auto relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Our Journey So Far
            </h2>
            <p className="text-text-secondary text-lg max-w-3xl mx-auto">
              From innovative projects to growing community, here's what we've achieved together
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsDisplay.map((stat) => (
              <div key={stat.key} className="text-center group">
                <div className="relative bg-gradient-to-br from-primary-blue/10 to-accent-cyan/5 border border-dark-border/50 rounded-xl p-6 hover:border-primary-blue/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-blue/10">
                  <div className="text-3xl md:text-4xl font-bold font-mono bg-gradient-to-r from-primary-blue to-accent-cyan bg-clip-text text-transparent mb-2">
                    <CounterAnimation
                      end={stat.value}
                      suffix={stat.key === 'workshopsHeld' ? '+' : '+'}
                    />
                  </div>
                  <div className="text-text-secondary text-sm md:text-base font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Subtle geometric background */}
          <div className="absolute inset-0 pointer-events-none opacity-5">
            <svg className="w-full h-full">
              <defs>
                <pattern id="grid" patternUnits="userSpaceOnUse" width="60" height="60">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary-blue"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              What We Do
            </h2>
            <p className="text-text-secondary text-lg max-w-3xl mx-auto">
              Our club focuses on hands-on learning, collaboration, and innovation in the AI space.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover-lift group relative overflow-hidden">
                <CardContent className="p-2 relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/10 border border-primary-blue/30 rounded-xl mb-4 text-primary-blue group-hover:shadow-lg group-hover:shadow-primary-blue/25 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3 font-mono">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
                {/* Terminal-style border effect */}
                <div className="absolute inset-0 border border-transparent group-hover:border-primary-blue/30 rounded-lg transition-all duration-300"></div>
                {/* Circuit pattern background */}
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                  <div className="w-full h-full bg-gradient-to-br from-primary-blue/10 to-transparent"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Projects Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Recent Projects
            </h2>
            <p className="text-text-secondary text-lg max-w-3xl mx-auto">
              Check out some of our latest innovations and collaborative efforts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="block group">
                <div className="relative overflow-hidden rounded-xl bg-dark-surface border border-dark-border hover:border-primary-blue/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary-blue/10 h-full">
                  {/* Thumbnail Image */}
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-dark-bg to-dark-surface">
                    {project.thumbnail_image?.public_url || project.thumbnail_url ? (
                      <Image
                        src={project.thumbnail_image?.public_url || project.thumbnail_url}
                        alt={project.thumbnail_image?.alt_text || project.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-blue/10 to-accent-cyan/5">
                        <div className="text-center">
                          <Code className="w-16 h-16 text-primary-blue/40 mx-auto mb-2" />
                          <p className="text-xs text-text-tertiary font-mono">No preview</p>
                        </div>
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant={getStatusVariant(project.status)}
                        size="sm"
                        className="backdrop-blur-sm bg-dark-bg/80 font-mono text-xs shadow-lg"
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-primary-blue transition-colors duration-300 line-clamp-1">
                      {project.title}
                    </h3>

                    {/* Contributors */}
                    {project.contributors && project.contributors.length > 0 ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-3">
                            {project.contributors.slice(0, 4).map((contributor, idx) => {
                              const profile = contributor.profiles || contributor.profile
                              const initial = (profile?.full_name?.[0] || profile?.username?.[0] || '?').toUpperCase()
                              const colors = ['bg-primary-blue', 'bg-accent-cyan', 'bg-purple-500', 'bg-pink-500']
                              return (
                                <div
                                  key={contributor.id || idx}
                                  className={`w-9 h-9 rounded-full ${colors[idx % colors.length]} flex items-center justify-center text-sm text-white font-semibold border-2 border-dark-surface ring-2 ring-dark-bg transition-transform group-hover:scale-110`}
                                  title={`${profile?.full_name || profile?.username} - ${contributor.contribution_percentage}%`}
                                >
                                  {initial}
                                </div>
                              )
                            })}
                            {project.contributors.length > 4 && (
                              <div className="w-9 h-9 rounded-full bg-dark-border flex items-center justify-center text-xs text-text-secondary font-semibold border-2 border-dark-surface ring-2 ring-dark-bg">
                                +{project.contributors.length - 4}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-text-tertiary">
                            <Users className="w-4 h-4 inline mr-1" />
                            {project.contributors.length}
                          </div>
                        </div>

                        {/* View details indicator */}
                        <div className="text-primary-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-text-tertiary">
                          <Users className="w-4 h-4 inline mr-1" />
                          No contributors yet
                        </div>
                        <div className="text-primary-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hover border glow effect */}
                  <div className="absolute inset-0 rounded-xl border-2 border-primary-blue/0 group-hover:border-primary-blue/20 transition-all duration-300 pointer-events-none" />
                </div>
              </Link>
            ))}

            {/* Show "View All Projects" card if less than 3 projects */}
            {recentProjects.length < 3 && Array.from({ length: 3 - recentProjects.length }).map((_, index) => (
              <Card key={`viewall-${index}`} variant="interactive" className="hover-lift group">
                <Link href="/projects">
                  <CardContent className="p-2 text-center h-full flex flex-col justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-primary-blue/25 transition-all duration-300">
                      <Code className="w-8 h-8 text-primary-blue" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      View All Projects
                    </h3>
                    <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                      Discover more of our innovative projects and technical achievements
                    </p>
                    <div className="flex items-center justify-center gap-2 text-primary-blue group-hover:text-accent-cyan transition-colors duration-300">
                      <span className="text-sm font-medium">Browse Projects</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>

          {recentProjects.length >= 3 && (
            <div className="text-center mt-12">
              <Link href="/projects">
                <Button variant="secondary" size="lg">
                  View All Projects
                  <ArrowRight className="ml-2 w-4 h-4" />
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
                        src={post.thumbnail_image.public_url}
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
