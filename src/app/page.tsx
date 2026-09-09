import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { CounterAnimation } from '@/components/CounterAnimation'
import { SITE_CONFIG } from '@/lib/constants'
import { generateMetadata as generateSEOMetadata, generateOrganizationSchema } from '@/lib/seo'
import { cn } from '@/lib/utils'
import { Code, Users, ArrowRight, Github, ExternalLink, Calendar, Clock, Newspaper, Target, BookOpen, Trophy, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'
import { CommunityUpdatesCarousel } from '@/components/home/CommunityUpdatesCarousel'

// Ambient activity texture for the hero console panel — fixed values (not
// randomized) so server and client render identically and avoid a hydration
// mismatch. Purely decorative: no real per-period activity data exists yet.
const HEATMAP_OPACITIES = [
  0.15, 0.85, 0.3, 0.6, 0.15, 0.9, 0.4, 0.2, 0.7, 0.5, 0.15, 1,
  0.4, 0.15, 0.6, 0.9, 0.3, 0.15, 0.7, 0.4, 1, 0.2, 0.5, 0.3,
]

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

// Canonical section header: an accent-colored eyebrow kicker, title + optional
// subtitle on the left, optional CTA link(s) on the right of the same baseline
// row. One header per section — the kicker color is what visually tells each
// section apart (Products = blue, Community Activities = orange, Programs = purple).
function SectionHeading({
  kicker,
  kickerColorClass,
  title,
  subtitle,
  cta,
}: {
  kicker: string
  kickerColorClass: string
  title: string
  subtitle?: string
  cta?: { href: string; label: string } | { href: string; label: string }[]
}) {
  const ctas = cta ? (Array.isArray(cta) ? cta : [cta]) : []

  return (
    <div className="mb-8 sm:mb-10 lg:-mx-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <span className={cn('inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] mb-3.5', kickerColorClass)}>
          <span className="w-[18px] h-0.5 rounded-sm bg-current" />
          {kicker}
        </span>
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

    // All four reads are independent — run them concurrently instead of
    // four sequential round-trips.
    const [
      { count: projectsCount },
      { count: membersCount },
      { count: postsCount },
      { data: postsData },
    ] = await Promise.all([
      supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published'),
      supabase
        .from('posts')
        .select('view_count')
        .eq('status', 'published'),
    ])

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

const RECENT_PROJECTS_TARGET = 6
const PROJECT_CARD_FIELDS = `
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
`

function mapProjectRow(project: any): Project {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status,
    repo_url: project.repo_url,
    demo_url: project.demo_url,
    thumbnail_url: project.thumbnail_url,
    thumbnail_image: project.thumbnail_image,
  }
}

// Fetch Recent Products from database. Featured projects lead (the bento's
// large slot goes to the newest one), then — since the sidebar has room for
// more than 3 — we top up with the most recent non-featured projects so the
// section always fills out to RECENT_PROJECTS_TARGET instead of leaving the
// sidebar sparse when few projects are marked featured.
async function getRecentProjects(): Promise<Project[]> {
  try {
    const supabase = createClient()

    const { data: featured, error: featuredError } = await supabase
      .from('projects')
      .select(PROJECT_CARD_FIELDS)
      .eq('featured', true)
      .in('status', ['active', 'completed'])
      .order('created_at', { ascending: false })
      .limit(RECENT_PROJECTS_TARGET)

    if (featuredError) {
      console.error('Error fetching Recent Products:', featuredError)
      return []
    }

    const projects = (featured || []).map(mapProjectRow)
    const remaining = RECENT_PROJECTS_TARGET - projects.length

    if (remaining > 0) {
      const excludeIds = projects.map((p) => p.id)
      let fillerQuery = supabase
        .from('projects')
        .select(PROJECT_CARD_FIELDS)
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false })
        .limit(remaining)

      if (excludeIds.length > 0) {
        fillerQuery = fillerQuery.not('id', 'in', `(${excludeIds.join(',')})`)
      }
      // Note: Supabase's `.not(col, 'in', array)` builds a Postgres literal
      // list, so an array of plain UUID strings is safe here — no user input
      // ever reaches this filter.

      const { data: filler, error: fillerError } = await fillerQuery

      if (fillerError) {
        console.error('Error fetching filler products:', fillerError)
      } else if (filler) {
        projects.push(...filler.map(mapProjectRow))
      }
    }

    return projects
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
        id,
        title,
        summary,
        slug,
        category,
        reading_time,
        view_count,
        published_at,
        thumbnail_image:images!posts_thumbnail_image_id_fkey(
          public_url,
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

  // shortLabel is what the console readout shows on mobile, where the row
  // narrows to 3 columns and the full label would wrap awkwardly.
  const statsData = [
    { label: 'Members', shortLabel: 'Members', value: stats.activeMembers, key: 'activeMembers', icon: Users },
    { label: 'Products', shortLabel: 'Products', value: stats.activeProjects, key: 'activeProjects', icon: Code },
    { label: 'Contest Participants', shortLabel: 'Contestants', value: stats.contestParticipants, key: 'contestParticipants', icon: Trophy },
    { label: 'Competitions Held', shortLabel: 'Competitions', value: stats.competitionsHeld, key: 'competitionsHeld', icon: Target },
    { label: 'Posts Shared', shortLabel: 'Posts', value: stats.postsShared, key: 'postsShared', icon: Newspaper },
    { label: 'Total Views', shortLabel: 'Views', value: stats.totalViews, key: 'totalViews', icon: Eye }
  ]

  // Programs (contests + courses) — single source so all cards share one layout.
  const programs = [
    {
      kind: 'Contest',
      icon: Target,
      accent: 'text-accent-cyan',
      badge: 'Public • Ended',
      badgeVariant: 'gray' as const,
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
      badgeVariant: 'gray' as const,
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
      {/* Hero Section — asymmetric: copy on the left, a live "console" panel
          on the right instead of a centered title over a six-box stat grid. */}
      <section className="relative py-10 px-4 sm:px-6 sm:py-16 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-surface/10 to-dark-bg" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_85%_-10%,rgba(37,99,235,0.18),transparent_60%)]" />

        <div className="container mx-auto max-w-[1180px] relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Copy */}
            <div className="text-center lg:text-left">
              <span className="block text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.18em] sm:tracking-[0.22em] text-accent-cyan mb-4 sm:mb-5">
                VNUHCM High School for the Gifted
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[1.85rem] xl:text-[2.2rem] 2xl:text-[2.5rem] leading-[1.05] font-[family-name:var(--font-shrikhand)] mb-5 lg:whitespace-nowrap break-words">
                <span className="gradient-text">THE NODERS COMMUNITY</span>
              </h1>

              <p className="text-lg sm:text-xl font-semibold text-text-primary mb-5">
                Connecting Minds • Creating Intelligence
              </p>

              <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl mx-auto lg:mx-0">
                A student tech community at VNUHCM High School for the Gifted. We build AI products, host workshops and DS/AI mini-courses, organize competitions, and grow a community passionate about coding and AI.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 sm:gap-4">
                <Link href="/products" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto group/cta">
                    Explore Products
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover/cta:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/contest" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    View Contests
                  </Button>
                </Link>
              </div>
            </div>

            {/* Live console panel — Members leads next to an ambient activity
                heatmap (no real monthly growth series exists yet to chart), the
                remaining five real metrics read as a dense status readout. */}
            <div className="rounded-[20px] border border-dark-border/60 bg-gradient-to-br from-dark-surface to-[#16223a] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-dark-border/60">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_0_3px_rgba(16,185,129,0.18)]" />
                  <span className="text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-text-tertiary">
                    Community Snapshot
                  </span>
                </div>
                <span className="text-[10.5px] font-semibold text-text-tertiary">Right now</span>
              </div>

              <div className="grid grid-cols-[auto_1fr] items-end gap-4 sm:gap-5 px-5 sm:px-6 pt-[22px] pb-[18px]">
                <div>
                  <div className="text-4xl sm:text-[52px] font-extrabold text-text-primary leading-none [font-variant-numeric:tabular-nums]">
                    <CounterAnimation end={stats.activeMembers} />
                  </div>
                  <div className="mt-2 text-xs font-bold text-text-tertiary">Members</div>
                </div>

                {/* Ambient activity texture — deliberately not tied to a real
                    time-series (no historical member-growth data exists yet). */}
                <div className="flex flex-col gap-2 w-full">
                  <div className="grid grid-cols-10 sm:grid-cols-12 gap-1 h-10 sm:h-14" aria-hidden="true">
                    {HEATMAP_OPACITIES.map((o, i) => (
                      <span key={i} className="rounded-sm bg-accent-cyan" style={{ opacity: o }} />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-text-tertiary">
                    <span className="sm:hidden">Active across products &amp; contests</span>
                    <span className="hidden sm:inline">Members active across products, posts &amp; contests</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 border-t border-dark-border/60">
                {statsData.filter((s) => s.key !== 'activeMembers').map((stat, i) => {
                  const isLastInMobileRow = (i + 1) % 3 === 0
                  const isSecondMobileRow = i >= 3
                  return (
                    <div
                      key={stat.key}
                      className={cn(
                        'px-3.5 py-4 flex flex-col gap-1 border-dark-border/60',
                        !isLastInMobileRow && 'border-r',
                        isSecondMobileRow && 'border-t sm:border-t-0',
                        'sm:border-r sm:last:border-r-0'
                      )}
                    >
                      <span className="text-xl font-extrabold text-text-primary leading-none [font-variant-numeric:tabular-nums]">
                        <CounterAnimation end={stat.value} />
                      </span>
                      <span className="text-[9.5px] font-bold uppercase tracking-[0.05em] text-text-tertiary leading-tight">
                        <span className="sm:hidden">{stat.shortLabel}</span>
                        <span className="hidden sm:inline">{stat.label}</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-10 px-4 sm:px-6 sm:py-16 lg:px-8 bg-dark-surface/40">
        <div className="container mx-auto max-w-[1180px]">
          <SectionHeading
            kicker="Community Activities"
            kickerColorClass="text-accent-orange"
            title="Latest Community Activities"
            subtitle="Stay up to date with our latest community moments, activities, and highlights."
            cta={{ href: '/posts', label: 'View All Posts' }}
          />

          <CommunityUpdatesCarousel posts={recentPosts} />
        </div>
      </section>

      {/* Recent Products Section */}
      <section className="py-10 px-4 sm:px-6 sm:py-16 lg:px-8">
        <div className="container mx-auto max-w-[1180px]">
          <SectionHeading
            kicker="Products"
            kickerColorClass="text-primary-blue"
            title="Recent Products"
            subtitle="Check out some of our latest innovations and collaborative efforts."
            cta={{ href: '/products', label: 'View All Products' }}
          />

          {/* Asymmetric bento — the newest featured product gets a large slot,
              the rest sit as a compact sidebar list. Same real fields as before
              (title, description, status, repo/demo links); just weighted by
              recency instead of three equal-size cards. */}
          {recentProjects.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 sm:gap-6 lg:px-7">
              {(() => {
                const [featured, ...rest] = recentProjects
                return (
                  <>
                    <Link href={`/products/${featured.id}`} className="block group">
                      <div className="relative overflow-hidden rounded-[22px] border border-dark-border/60 bg-dark-surface/70 backdrop-blur-sm transition-all duration-300 hover:border-primary-blue/40 hover:shadow-lg hover:shadow-primary-blue/10 sm:group-hover:-translate-y-1 h-full flex flex-col">
                        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary-blue/10 to-accent-cyan/5">
                          {featured.thumbnail_image?.public_url || featured.thumbnail_url ? (
                            <Image
                              src={(featured.thumbnail_image?.public_url || featured.thumbnail_url) as string}
                              alt={featured.thumbnail_image?.alt_text || featured.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                              loading="lazy"
                              sizes="(max-width: 1024px) 100vw, 55vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Code className="w-14 h-14 text-primary-blue/40" />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/60 via-transparent to-transparent opacity-60" />

                          <div className="absolute top-4 right-4 z-10">
                            <Badge
                              variant={getStatusVariant(featured.status)}
                              size="sm"
                              className="backdrop-blur-md bg-dark-bg/70 font-bold text-xs border border-white/10"
                            >
                              {featured.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="p-5 sm:p-[26px] flex-1 flex flex-col">
                          <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 line-clamp-2 leading-tight group-hover:text-primary-blue transition-colors duration-300">
                            {featured.title}
                          </h3>

                          {featured.description && (
                            <p className="text-text-secondary mb-4 line-clamp-3 leading-relaxed text-sm">
                              {featured.description}
                            </p>
                          )}

                          <div className="mt-auto pt-4 border-t border-dark-border/60">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                {featured.repo_url && (
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-blue/30 bg-primary-blue/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-blue">
                                    <Github className="w-3.5 h-3.5" />
                                    Source
                                  </span>
                                )}
                                {featured.demo_url && (
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent-cyan">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Live Demo
                                  </span>
                                )}
                                {!featured.repo_url && !featured.demo_url && (
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

                    {rest.length > 0 && (
                      <div>
                        {/* Mobile/tablet: horizontal scroll (matches the mockup's
                            m-mini-scroll) — a vertical stack here would just look
                            like a second copy of the "Recent Products" grid. */}
                        <div className="lg:hidden -mx-4 sm:-mx-6 px-4 sm:px-6 flex gap-3 overflow-x-auto no-scrollbar [scrollbar-width:none]">
                          {rest.map((project) => (
                            <Link
                              key={project.id}
                              href={`/products/${project.id}`}
                              className="block group shrink-0 w-[220px] rounded-2xl border border-dark-border/60 bg-dark-surface/70 backdrop-blur-sm p-3.5 transition-all duration-300 hover:border-primary-blue/40"
                            >
                              <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-gradient-to-br from-primary-blue/10 to-accent-cyan/5 mb-2.5">
                                {project.thumbnail_image?.public_url || project.thumbnail_url ? (
                                  <Image
                                    src={(project.thumbnail_image?.public_url || project.thumbnail_url) as string}
                                    alt={project.thumbnail_image?.alt_text || project.title}
                                    fill
                                    className="object-cover"
                                    loading="lazy"
                                    sizes="220px"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Code className="w-6 h-6 text-primary-blue/40" />
                                  </div>
                                )}
                              </div>
                              <h4 className="text-[13.5px] font-bold text-text-primary truncate group-hover:text-primary-blue transition-colors duration-300">
                                {project.title}
                              </h4>
                              {project.description && (
                                <p className="text-[11px] text-text-tertiary line-clamp-2 mt-1 leading-snug">
                                  {project.description}
                                </p>
                              )}
                            </Link>
                          ))}
                        </div>

                        {/* Desktop: vertical sidebar list */}
                        <div className="hidden lg:flex flex-col gap-5">
                          {rest.map((project) => (
                            <Link key={project.id} href={`/products/${project.id}`} className="block group flex-1">
                              <div className="h-full flex items-center gap-3.5 rounded-[18px] border border-dark-border/60 bg-dark-surface/70 backdrop-blur-sm p-[18px] transition-all duration-300 hover:border-primary-blue/40 hover:shadow-lg hover:shadow-primary-blue/10">
                                <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-primary-blue/10 to-accent-cyan/5">
                                  {project.thumbnail_image?.public_url || project.thumbnail_url ? (
                                    <Image
                                      src={(project.thumbnail_image?.public_url || project.thumbnail_url) as string}
                                      alt={project.thumbnail_image?.alt_text || project.title}
                                      fill
                                      className="object-cover"
                                      loading="lazy"
                                      sizes="56px"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Code className="w-6 h-6 text-primary-blue/40" />
                                    </div>
                                  )}
                                  <span
                                    className={cn(
                                      'absolute top-1 right-1 w-1.5 h-1.5 rounded-full ring-2 ring-dark-surface',
                                      project.status.toLowerCase() === 'active' ? 'bg-success' : 'bg-text-tertiary'
                                    )}
                                  />
                                </div>

                                <div className="min-w-0">
                                  <h4 className="text-sm font-bold text-text-primary truncate group-hover:text-primary-blue transition-colors duration-300">
                                    {project.title}
                                  </h4>
                                  {project.description && (
                                    <p className="text-xs text-text-tertiary line-clamp-2 mt-1 leading-snug">
                                      {project.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          )}

        </div>
      </section>

      {/* Our Programs Section - Contests & Education Combined */}
      <section className="py-10 px-4 sm:px-6 sm:py-16 lg:px-8 bg-dark-surface/40">
        <div className="container mx-auto max-w-[1180px]">
          <SectionHeading
            kicker="Programs"
            kickerColorClass="text-accent-purple"
            title="Our Programs"
            subtitle="Competitions to challenge yourself and courses to build your skills."
            cta={[
              { href: '/contest', label: 'All Contests' },
              { href: '/education', label: 'All Courses' },
            ]}
          />

          {/* Editorial list rows on desktop — each program reads as one line
              item in a program log. On mobile, each program becomes its own
              card (matches the mockup's separate .m-prog-card treatment;
              a bare stacked row reads as loose text with no boundaries). */}
          <div className="lg:px-7">
            {programs.map((program, i) => {
              const isLast = i === programs.length - 1
              return (
                <Link key={program.title} href={program.href} className="block group">
                  {/* Mobile card */}
                  <div className="sm:hidden rounded-2xl border border-dark-border/60 bg-dark-surface/70 p-4 mb-3 transition-colors duration-300 group-hover:border-primary-blue/40">
                    <div className="flex items-start justify-between mb-2.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.06em] text-accent-purple">
                        {program.kind}
                      </span>
                      <Badge variant={program.badgeVariant} className="whitespace-nowrap">{program.badge}</Badge>
                    </div>
                    <h3 className="text-base font-bold text-text-primary mb-2 group-hover:text-primary-blue transition-colors">
                      {program.title}
                    </h3>
                    <p className="text-text-secondary text-[12.5px] leading-relaxed mb-2.5">
                      {program.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-2.5 text-[11px] text-text-tertiary">
                      {program.meta.map((item, mi) => {
                        const MetaIcon = item.icon
                        return (
                          <div key={mi} className="flex items-center gap-1.5">
                            <MetaIcon className="w-3.5 h-3.5" />
                            <span>{item.label}</span>
                          </div>
                        )
                      })}
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-cyan">
                      {program.cta}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Desktop editorial row */}
                  <div
                    className={cn(
                      'hidden sm:grid grid-cols-[64px_1fr_auto] gap-6 items-center py-[22px] border-t border-dark-border/60 transition-colors duration-300',
                      isLast && 'border-b'
                    )}
                  >
                    <div className="text-[13px] font-extrabold text-text-tertiary">
                      {String(i + 1).padStart(2, '0')}
                      <span className="block mt-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-accent-purple">
                        {program.kind}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xl font-bold text-text-primary mb-1.5 group-hover:text-primary-blue transition-colors">
                        {program.title}
                      </h3>
                      <p className="text-text-secondary text-sm leading-relaxed line-clamp-2 max-w-xl">
                        {program.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-text-tertiary">
                        {program.meta.map((item, mi) => {
                          const MetaIcon = item.icon
                          return (
                            <div key={mi} className="flex items-center gap-1.5">
                              <MetaIcon className="w-3.5 h-3.5" />
                              <span>{item.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-center gap-2">
                      <Badge variant={program.badgeVariant} className="whitespace-nowrap">{program.badge}</Badge>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-cyan group-hover:gap-2.5 transition-all">
                        {program.cta}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
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
