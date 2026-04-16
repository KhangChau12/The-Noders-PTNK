import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { CounterAnimation } from '@/components/CounterAnimation'
import { SITE_CONFIG } from '@/lib/constants'
import { generateMetadata as generateSEOMetadata, generateOrganizationSchema } from '@/lib/seo'
import { Code, Users, ArrowRight, Github, ExternalLink, Calendar, Clock, Newspaper, Target, BookOpen, Trophy, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'
import { CommunityUpdatesCarousel } from '@/components/home/CommunityUpdatesCarousel'

interface Stats {
  activeProjects: number
  activeMembers: number
  postsShared: number
  totalViews: number
  competitionsHeld: number
  contestParticipants: number
}

interface Project {
  id: string
  title: string
  description: string
  status: string
  repo_url?: string
  demo_url?: string
  thumbnail_url?: string
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
  view_count: number
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

    const totalViews = postsData?.reduce((sum, post: any) => sum + (post.view_count || 0), 0) || 0

    // For competitions, we have NAIC 2025 and PAIC 2026
    const competitionsCount = 2

    return {
      activeProjects: projectsCount || 0,
      activeMembers: membersCount || 0,
      postsShared: postsCount || 0,
      totalViews: totalViews,
      competitionsHeld: competitionsCount,
      contestParticipants: 79
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    // Fallback to default values
    return {
      activeProjects: 8,
      activeMembers: 15,
      postsShared: 25,
      totalViews: 0,
      competitionsHeld: 2,
      contestParticipants: 79
    }
  }
}

// Fetch Recent Products from database
async function getRecentProjects(): Promise<Project[]> {
  try {
    const supabase = createClient()

    // Get featured projects (up to 3) with only fields needed for homepage cards
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        id,
        title,
        description,
        status,
        repo_url,
        demo_url,
        thumbnail_url,
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
      console.error('Error fetching Recent Products:', error)
      return []
    }

    // Transform the data to match the expected format
    return projects?.map((project: any) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      repo_url: project.repo_url,
      demo_url: project.demo_url,
      thumbnail_url: project.thumbnail_url,
      thumbnail_image: project.thumbnail_image
    })) || []
  } catch (error) {
    console.error('Failed to fetch Recent Products:', error)
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
      .eq('category', 'Community Activities')
      .order('published_at', { ascending: false })
      .limit(10)

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

  const statsData = [
    { label: 'Members', value: stats.activeMembers, key: 'activeMembers', icon: Users },
    { label: 'Products', value: stats.activeProjects, key: 'activeProjects', icon: Code },
    { label: 'Contest Participants', value: stats.contestParticipants, key: 'contestParticipants', icon: Trophy },
    { label: 'Competitions Held', value: stats.competitionsHeld, key: 'competitionsHeld', icon: Target },
    { label: 'Posts Shared', value: stats.postsShared, key: 'postsShared', icon: Newspaper },
    { label: 'Total Views', value: stats.totalViews, key: 'totalViews', icon: Eye }
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
      case 'Tech Sharing':
        return 'tech'
      default:
        return 'secondary'
    }
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

      <NeuralNetworkBackground />
      <div className="min-h-screen relative z-10">
      {/* Hero & Stats Section */}
      <section className="relative py-14 px-4 sm:px-6 sm:py-20 lg:px-8 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-surface/10 to-dark-bg" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />

        <div className="container mx-auto relative z-10">
          {/* Hero Content */}
          <div className="text-center mb-10 md:mb-16 mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.02] sm:leading-[0.95] font-[family-name:var(--font-shrikhand)] mb-4 px-2 break-words">
              <span className="gradient-text">
                THE NODERS COMMUNITY
              </span>
            </h1>

            <p className="text-lg text-text-secondary mb-3 max-w-4xl mx-auto">
              A student technology community at VNUHCM High School for the Gifted
            </p>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-5 sm:mb-6 text-text-primary max-w-4xl mx-auto px-1">
              Connecting Minds • Creating Intelligence
            </h2>

            <p className="text-base sm:text-lg text-text-secondary mb-4 sm:mb-6 leading-relaxed max-w-4xl mx-auto px-1">
              We build AI products, host workshops and DS/AI mini-courses, organize AI competitions, guide students through AI learning roadmaps, and grow a community passionate about coding and AI.
            </p>
          </div>

          {/* Stats Content */}
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 max-w-7xl mx-auto">
            {statsData.map((stat, index) => (
              <div key={stat.key} className="group relative">
                {/* Decorative background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                        
                <Card className="relative h-full overflow-hidden bg-dark-surface/70 backdrop-blur-sm border border-dark-border/60 hover:border-primary-blue/40 transition-all duration-300">
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardContent className="p-2.5 sm:p-4 flex flex-col items-center justify-center relative z-10 min-h-[98px] sm:min-h-[110px]">
                    {/* Watermark Icon */}
                    <div className="absolute -bottom-6 -right-6 text-primary-blue opacity-10 group-hover:opacity-[0.15] transition-all duration-500 transform -rotate-12 group-hover:-rotate-6 group-hover:scale-110 pointer-events-none">
                       <stat.icon className="w-24 h-24 sm:w-32 sm:h-32" strokeWidth={1} />
                    </div>

                    <div className="text-lg sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary mb-1 relative z-20">
                       <CounterAnimation end={stat.value} />
                    </div>

                    <div className="text-[10px] md:text-[11px] font-semibold text-text-secondary uppercase tracking-[0.14em] md:tracking-[0.18em] text-center relative z-20 leading-tight">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-14 px-4 sm:px-6 sm:py-20 lg:px-8 bg-dark-surface/50">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Latest Community Activities
            </h2>
            <p className="text-text-secondary text-base sm:text-lg max-w-3xl mx-auto">
              Stay up to date with our latest community moments, activities, and highlights.
            </p>
          </div>

          <CommunityUpdatesCarousel posts={recentPosts} />
        </div>
      </section>

      {/* Recent Products Section */}
      <section className="py-14 px-4 sm:px-6 sm:py-20 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Recent Products
            </h2>
            <p className="text-text-secondary text-base sm:text-lg max-w-3xl mx-auto">
              Check out some of our latest innovations and collaborative efforts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 xl:gap-7 max-w-none mx-auto">
            {recentProjects.map((project) => (
              <Link key={project.id} href={`/products/${project.id}`} className="block group">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-surface/90 to-dark-bg/90 border-2 border-dark-border/50 hover:border-primary-blue/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-blue/20 h-full flex flex-col backdrop-blur-sm sm:hover:-translate-y-2">

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
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                      <Badge
                        variant={getStatusVariant(project.status)}
                        size="sm"
                        className="backdrop-blur-xl bg-dark-bg/80 font-bold text-xs shadow-xl border border-white/10"
                      >
                        {project.status}
                      </Badge>
                    </div>

                    {/* Quick action buttons on hover */}
                    <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0">
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
                  <div className="p-4 sm:p-6 flex-1 flex flex-col relative z-10">
                    {/* Title with gradient hover effect */}
                    <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-3 group-hover:bg-gradient-to-r group-hover:from-primary-blue group-hover:to-accent-cyan group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 line-clamp-2 leading-tight">
                      {project.title}
                    </h3>

                    {/* Description is intentionally longer to help users scan project context quickly */}
                    {project.description && (
                      <p className="text-text-secondary/90 mb-4 sm:mb-5 line-clamp-4 leading-relaxed text-sm sm:text-[15px]">
                        {project.description}
                      </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-dark-border/60 group-hover:border-primary-blue/30 transition-colors duration-300">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {project.repo_url && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-blue/30 bg-primary-blue/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-blue">
                              <Github className="w-3.5 h-3.5" />
                              Source
                            </span>
                          )}
                          {project.demo_url && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent-cyan">
                              <ExternalLink className="w-3.5 h-3.5" />
                              Live Demo
                            </span>
                          )}
                          {!project.repo_url && !project.demo_url && (
                            <span className="inline-flex items-center rounded-full border border-dark-border bg-dark-bg/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                              Product Details
                            </span>
                          )}
                        </div>

                        <div className="text-primary-blue opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover border glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: '0 0 30px rgba(59, 130, 246, 0.3), inset 0 0 30px rgba(6, 182, 212, 0.1)' }} />
                </div>
              </Link>
            ))}
          </div>

          {recentProjects.length >= 1 && (
            <div className="text-center mt-12">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full border border-primary-blue/40 bg-dark-surface/60 px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-text-secondary backdrop-blur-md transition-all duration-300 hover:border-primary-blue/70 hover:text-primary-blue hover:shadow-lg hover:shadow-primary-blue/20"
              >
                View All Products
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Our Programs Section - Contests & Education Combined */}
      <section className="py-14 px-4 sm:px-6 sm:py-20 lg:px-8 bg-dark-surface/30">
        <div className="container mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Our Programs
            </h2>
            <p className="text-text-secondary text-base sm:text-lg max-w-3xl mx-auto">
              Competitions to challenge yourself and courses to build your skills
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8 max-w-7xl mx-auto">
            {/* PAIC 2026 Card */}
            <Card variant="hover" className="hover-lift group bg-gradient-to-br from-accent-cyan/10 to-primary-blue/10 border border-accent-cyan/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-accent-cyan" />
                  <span className="text-xs font-semibold text-accent-cyan uppercase tracking-wider">Contest</span>
                </div>
                <Badge variant="primary" className="mb-3">Public • Ended</Badge>
                <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-accent-cyan transition-colors">
                  PTNK AI Challenge 2026
                </h3>
                <p className="text-text-secondary text-sm mb-4 leading-relaxed line-clamp-2">
                  Our flagship public competition. Build IELTS scoring models and compete for cash prizes up to 1,000,000 VNĐ.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-text-tertiary">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>24 Teams • 54 Participants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>05 Jan - 18 Jan</span>
                  </div>
                </div>
                <Link href="/contest/paic-2026">
                  <Button variant="secondary" size="sm" className="w-full group/btn">
                    View Results
                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* NAIC 2025 Card */}
            <Card variant="hover" className="hover-lift group bg-gradient-to-br from-primary-blue/10 to-accent-cyan/10 border border-primary-blue/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-primary-blue" />
                  <span className="text-xs font-semibold text-primary-blue uppercase tracking-wider">Contest</span>
                </div>
                <Badge variant="primary" className="mb-3">Internal • Ended</Badge>
                <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-primary-blue transition-colors">
                  Noders AI Competition 2025
                </h3>
                <p className="text-text-secondary text-sm mb-4 leading-relaxed line-clamp-2">
                  Our internal training ground where members sharpen AI skills through hands-on IELTS scoring challenges.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-text-tertiary">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>16 Participants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Nov - Dec 2025</span>
                  </div>
                </div>
                <Link href="/contest/naic-2025">
                  <Button variant="secondary" size="sm" className="w-full group/btn">
                    View Results
                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Data Science Module 1 Card */}
            <Card variant="hover" className="hover-lift group bg-gradient-to-br from-purple-500/10 to-primary-blue/10 border border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Course</span>
                </div>
                <Badge variant="warning" className="mb-3">Coming Soon</Badge>
                <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-purple-400 transition-colors">
                  Intro to Data Science
                </h3>
                <p className="text-text-secondary text-sm mb-4 leading-relaxed line-clamp-2">
                  Build a solid foundation in data science thinking. 4-session mini-course focused on fundamentals.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-text-tertiary">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Grade 10-11</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>4 × 1.5h</span>
                  </div>
                </div>
                <Link href="/education/ds-and-ai-01">
                  <Button variant="secondary" size="sm" className="w-full group/btn">
                    Learn More
                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link
              href="/contest"
              className="inline-flex items-center gap-2 rounded-full border border-primary-blue/40 bg-dark-surface/60 px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-text-secondary backdrop-blur-md transition-all duration-300 hover:border-primary-blue/70 hover:text-primary-blue hover:shadow-lg hover:shadow-primary-blue/20"
            >
              All Contests
              <ArrowRight className="h-4 w-4 transition-transform duration-300" />
            </Link>
            <Link
              href="/education"
              className="inline-flex items-center gap-2 rounded-full border border-primary-blue/40 bg-dark-surface/60 px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-text-secondary backdrop-blur-md transition-all duration-300 hover:border-primary-blue/70 hover:text-primary-blue hover:shadow-lg hover:shadow-primary-blue/20"
            >
              All Courses
              <ArrowRight className="h-4 w-4 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}
