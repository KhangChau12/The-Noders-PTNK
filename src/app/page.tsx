import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/Button'
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

// ---------------------------------------------------------------------------
// Shared homepage primitives — one consistent visual system across all sections.
// ---------------------------------------------------------------------------

// Canonical "view all" link — small, lives in the section header on the right.
function SectionCTA({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-text-secondary transition-colors duration-300 hover:text-primary-blue"
    >
      {label}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
    </Link>
  )
}

// Canonical section header: title + optional subtitle on the left, optional CTA
// link(s) on the right of the same baseline row. One header per section.
function SectionHeading({
  title,
  subtitle,
  cta,
}: {
  title: string
  subtitle?: string
  cta?: { href: string; label: string } | { href: string; label: string }[]
}) {
  const ctas = cta ? (Array.isArray(cta) ? cta : [cta]) : []

  return (
    <div className="mb-8 sm:mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {ctas.length > 0 && (
        <div className="flex items-center gap-5">
          {ctas.map((item) => (
            <SectionCTA key={item.href} href={item.href} label={item.label} />
          ))}
        </div>
      )}
    </div>
  )
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

  // Programs (contests + courses) — single source so all cards share one layout.
  const programs = [
    {
      kind: 'Contest',
      icon: Target,
      accent: 'text-accent-cyan',
      badge: 'Public • Ended',
      badgeVariant: 'primary' as const,
      title: 'PTNK AI Challenge 2026',
      description: 'Our flagship public competition. Build IELTS scoring models and compete for cash prizes up to 1,000,000 VNĐ.',
      meta: [
        { icon: Users, label: '24 Teams • 54 Participants' },
        { icon: Calendar, label: '05 Jan - 18 Jan' },
      ],
      href: '/contest/paic-2026',
      cta: 'View Results',
    },
    {
      kind: 'Contest',
      icon: Target,
      accent: 'text-primary-blue',
      badge: 'Internal • Ended',
      badgeVariant: 'primary' as const,
      title: 'Noders AI Competition 2025',
      description: 'Our internal training ground where members sharpen AI skills through hands-on IELTS scoring challenges.',
      meta: [
        { icon: Users, label: '16 Participants' },
        { icon: Calendar, label: 'Nov - Dec 2025' },
      ],
      href: '/contest/naic-2025',
      cta: 'View Results',
    },
    {
      kind: 'Course',
      icon: BookOpen,
      accent: 'text-accent-purple',
      badge: 'Coming Soon',
      badgeVariant: 'warning' as const,
      title: 'Intro to Data Science',
      description: 'Build a solid foundation in data science thinking. 4-session mini-course focused on fundamentals.',
      meta: [
        { icon: Users, label: 'Grade 10-11' },
        { icon: Clock, label: '4 × 1.5h' },
      ],
      href: '/education/ds-and-ai-01',
      cta: 'Learn More',
    },
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
      <section className="relative py-12 px-4 sm:px-6 sm:py-16 lg:px-8 overflow-hidden">
        {/* Single subtle gradient — lets the global neural-net background show through */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-surface/10 to-dark-bg" />

        <div className="container mx-auto relative z-10">
          {/* Hero Content */}
          <div className="text-center mb-10 sm:mb-14 mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] sm:leading-[0.95] font-[family-name:var(--font-shrikhand)] mb-5 px-2 break-words">
              <span className="gradient-text">
                THE NODERS COMMUNITY
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl font-semibold text-text-primary mb-5">
              Connecting Minds • Creating Intelligence
            </p>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-3xl mx-auto mb-8 px-1">
              A student tech community at VNUHCM High School for the Gifted. We build AI products, host workshops and DS/AI mini-courses, organize competitions, and grow a community passionate about coding and AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/products">
                <Button variant="primary" size="lg" className="w-full sm:w-auto group/cta">
                  Explore Products
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover/cta:translate-x-1" />
                </Button>
              </Link>
              <Link href="/members">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Meet the Community
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats band — one cohesive metrics strip */}
          <div className="max-w-6xl mx-auto rounded-3xl border border-dark-border/50 bg-dark-surface/40 backdrop-blur-sm p-3 sm:p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {statsData.map((stat) => (
                <div
                  key={stat.key}
                  className="group relative h-full overflow-hidden rounded-xl border border-dark-border/50 bg-dark-bg/40 transition-all duration-300 hover:border-primary-blue/40"
                >
                  <div className="flex flex-col items-center justify-center p-3 sm:p-4 relative z-10 min-h-[96px] sm:min-h-[108px]">
                    {/* Quiet watermark — background mark, not a focal point */}
                    <stat.icon
                      className="absolute -bottom-3 -right-3 w-16 h-16 sm:w-20 sm:h-20 text-primary-blue opacity-[0.06] pointer-events-none"
                      strokeWidth={1.5}
                    />

                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary mb-1.5 relative z-20">
                      <CounterAnimation end={stat.value} />
                    </div>

                    <div className="text-[10px] md:text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.14em] md:tracking-[0.16em] text-center relative z-20 leading-tight">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-12 px-4 sm:px-6 sm:py-16 lg:px-8 bg-dark-surface/40">
        <div className="container mx-auto">
          <SectionHeading
            title="Latest Community Activities"
            subtitle="Stay up to date with our latest community moments, activities, and highlights."
            cta={{ href: '/posts', label: 'View All Posts' }}
          />

          <CommunityUpdatesCarousel posts={recentPosts} />
        </div>
      </section>

      {/* Recent Products Section */}
      <section className="py-12 px-4 sm:px-6 sm:py-16 lg:px-8">
        <div className="container mx-auto">
          <SectionHeading
            title="Recent Products"
            subtitle="Check out some of our latest innovations and collaborative efforts."
            cta={{ href: '/products', label: 'View All Products' }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {recentProjects.map((project) => (
              <Link key={project.id} href={`/products/${project.id}`} className="block group">
                <div className="relative overflow-hidden rounded-2xl border border-dark-border/60 bg-dark-surface/70 backdrop-blur-sm transition-all duration-300 hover:border-primary-blue/40 hover:shadow-lg hover:shadow-primary-blue/10 sm:group-hover:-translate-y-1 h-full flex flex-col">

                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary-blue/10 to-accent-cyan/5">
                    {project.thumbnail_image?.public_url || project.thumbnail_url ? (
                      <Image
                        src={(project.thumbnail_image?.public_url || project.thumbnail_url) as string}
                        alt={project.thumbnail_image?.alt_text || project.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Code className="w-14 h-14 text-primary-blue/40" />
                      </div>
                    )}

                    {/* Subtle bottom gradient for badge legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/60 via-transparent to-transparent opacity-60" />

                    {/* Status badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <Badge
                        variant={getStatusVariant(project.status)}
                        size="sm"
                        className="backdrop-blur-md bg-dark-bg/70 font-bold text-xs border border-white/10"
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Content section */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col">
                    <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2 line-clamp-2 leading-tight group-hover:text-primary-blue transition-colors duration-300">
                      {project.title}
                    </h3>

                    {project.description && (
                      <p className="text-text-secondary mb-4 line-clamp-3 leading-relaxed text-sm">
                        {project.description}
                      </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-dark-border/60">
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

                        <ArrowRight className="w-5 h-5 text-primary-blue opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* Our Programs Section - Contests & Education Combined */}
      <section className="py-12 px-4 sm:px-6 sm:py-16 lg:px-8 bg-dark-surface/40">
        <div className="container mx-auto">
          <SectionHeading
            title="Our Programs"
            subtitle="Competitions to challenge yourself and courses to build your skills."
            cta={[
              { href: '/contest', label: 'All Contests' },
              { href: '/education', label: 'All Courses' },
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto">
            {programs.map((program) => {
              const Icon = program.icon
              return (
                <Link key={program.title} href={program.href} className="block group h-full">
                  <div className="relative h-full flex flex-col rounded-2xl border border-dark-border/60 bg-dark-surface/70 backdrop-blur-sm p-6 transition-all duration-300 hover:border-primary-blue/40 hover:shadow-lg hover:shadow-primary-blue/10 sm:group-hover:-translate-y-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Icon className={`w-5 h-5 ${program.accent}`} />
                      <span className={`text-xs font-semibold uppercase tracking-[0.15em] ${program.accent}`}>
                        {program.kind}
                      </span>
                    </div>

                    <Badge variant={program.badgeVariant} className="mb-3 self-start">{program.badge}</Badge>

                    <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-primary-blue transition-colors">
                      {program.title}
                    </h3>

                    <p className="text-text-secondary text-sm mb-4 leading-relaxed line-clamp-2">
                      {program.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-5 text-xs text-text-tertiary">
                      {program.meta.map((item, i) => {
                        const MetaIcon = item.icon
                        return (
                          <div key={i} className="flex items-center gap-1.5">
                            <MetaIcon className="w-3.5 h-3.5" />
                            <span>{item.label}</span>
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-auto pt-4 border-t border-dark-border/60 flex items-center justify-between">
                      <span className="text-sm font-semibold text-text-secondary group-hover:text-primary-blue transition-colors">
                        {program.cta}
                      </span>
                      <ArrowRight className="w-5 h-5 text-primary-blue opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

        </div>
      </section>
    </div>
    </>
  )
}
