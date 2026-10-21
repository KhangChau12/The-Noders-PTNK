import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { SITE_CONFIG, SOCIAL_LINKS } from '@/lib/constants'
import { generateMetadata as generateSEOMetadata, generateOrganizationSchema } from '@/lib/seo'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { CONTESTS, PROGRAM_TOTALS } from '@/lib/programs'
import { Container, Mono, PrimaryLink, SecondaryLink, SectionHeader, SectionTitle, TextLink } from '@/components/editorial'

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

export const metadata = generateSEOMetadata({
  title: 'Home',
  description: SITE_CONFIG.description,
  keywords: ['AI workshops', 'student-led tech community', 'PTNK projects', 'high school developers'],
  url: '/',
})

/**
 * Set this once real event photography exists (e.g. a file in /public). Until
 * then the hero shows the latest community post's cover with a real caption,
 * so nothing on the page is placeholder art.
 */
const HERO_PHOTO: { src: string; alt: string; caption: string } | null = null

interface HomeProject {
  id: string
  title: string
  description: string
  tech_stack: string[] | null
  created_at: string
  thumbnail_url?: string | null
  thumbnail_image?: { public_url: string; alt_text?: string | null } | null
}

interface HomePost {
  id: string
  title: string
  slug: string
  category: string
  reading_time: number | null
  published_at: string | null
  created_at: string
  author?: { full_name: string | null } | null
  thumbnail_image?: { public_url: string; alt_text?: string | null } | null
}

interface HomeMember {
  id: string
  full_name: string | null
  username: string | null
  role: string
}

const PROJECT_FIELDS = `
  id,
  title,
  description,
  tech_stack,
  created_at,
  thumbnail_url,
  thumbnail_image:images(public_url, alt_text)
`

const POST_FIELDS = `
  id,
  title,
  slug,
  category,
  reading_time,
  published_at,
  created_at,
  author:profiles!posts_author_id_fkey(full_name),
  thumbnail_image:images!posts_thumbnail_image_id_fkey(public_url, alt_text)
`

async function getHomeData() {
  const supabase = createClient()
  try {
    const [projectsCount, featured, recent, posts, members] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }).in('status', ['active', 'completed']),
      supabase
        .from('projects')
        .select(PROJECT_FIELDS)
        .eq('featured', true)
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('projects')
        .select(PROJECT_FIELDS)
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('posts')
        .select(POST_FIELDS)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(6),
      supabase.from('profiles').select('id, full_name, username, role').order('full_name', { ascending: true }),
    ])

    // Featured projects lead; top up with the newest ones to always show four.
    const seen = new Set<string>()
    const projects = [...((featured.data as unknown as HomeProject[]) || []), ...((recent.data as unknown as HomeProject[]) || [])]
      .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)))
      .slice(0, 4)

    const memberList = ((members.data as HomeMember[]) || []).sort((a, b) => {
      const aCore = a.role === 'admin' ? 0 : 1
      const bCore = b.role === 'admin' ? 0 : 1
      return aCore - bCore || (a.full_name || '').localeCompare(b.full_name || '')
    })

    return {
      projectsCount: projectsCount.count || 0,
      projects,
      posts: ((posts.data as unknown as HomePost[]) || []).map((p) => ({
        ...p,
        author: Array.isArray(p.author) ? p.author[0] : p.author,
      })),
      members: memberList,
    }
  } catch (error) {
    console.error('Failed to load homepage data:', error)
    return { projectsCount: 0, projects: [] as HomeProject[], posts: [] as HomePost[], members: [] as HomeMember[] }
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' })
}

/** Emoji in titles read as noise next to the editorial type. */
function cleanTitle(title: string) {
  return title.replace(/(?:[\u2600-\u27BF]|[\uD83C-\uDBFF][\uDC00-\uDFFF])\uFE0F?\s*/g, '').trim()
}

function projectImage(p: HomeProject) {
  return p.thumbnail_image?.public_url || p.thumbnail_url || null
}

export default async function HomePage() {
  const { projectsCount, projects, posts, members } = await getHomeData()
  const paic = CONTESTS[0]

  const heroFallback = posts.find((p) => p.category === 'Community Activities' && p.thumbnail_image?.public_url)
  const heroFigure = HERO_PHOTO
    ? { src: HERO_PHOTO.src, alt: HERO_PHOTO.alt, caption: HERO_PHOTO.caption, href: null as string | null }
    : heroFallback
      ? {
          src: heroFallback.thumbnail_image!.public_url,
          alt: heroFallback.thumbnail_image!.alt_text || cleanTitle(heroFallback.title),
          caption: cleanTitle(heroFallback.title),
          href: `/posts/${heroFallback.slug}`,
        }
      : null

  const facts = [
    { value: members.length, label: 'members' },
    { value: projectsCount, label: 'products shipped' },
    { value: PROGRAM_TOTALS.contests, label: 'AI contests run' },
    { value: PROGRAM_TOTALS.paicSubmissions, label: `submissions at ${paic.shortName}` },
    { value: PROGRAM_TOTALS.courseSessions, label: 'course sessions taught' },
  ]

  const pillars = [
    {
      title: 'Build',
      body: 'Members ship tools classmates actually use — IELTS 4 Life grades Task 2 essays, SAT Revision Hub keeps a free, up-to-date question bank.',
      link: `See ${projectsCount} products`,
      href: '/products',
    },
    {
      title: 'Compete',
      body: 'We run AI contests on our own platform, modelled on VOAI and IOAI. Real data, hidden test sets, a public leaderboard.',
      link: 'Contest archive',
      href: '/contest',
    },
    {
      title: 'Learn',
      body: 'Short courses taught by members. Intro to Data Science & AI with PRISEE covered tabular data, vision and NLP in four sessions.',
      link: 'Courses',
      href: '/education',
    },
  ]

  const steps = [
    { n: '01', title: 'Follow along', body: 'Contests and courses are announced on our Facebook page first.' },
    { n: '02', title: 'Join a workshop or contest', body: 'Open to every PTNK student, beginners included.' },
    { n: '03', title: 'Become a member', body: 'Reach out to the core team when recruitment opens.' },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationSchema()) }}
      />

      {/* Navy field: hero + facts as one block, directly under the glass nav */}
      <section className="bg-navy text-white">
        <Container className="flex flex-wrap items-center gap-14 pt-10 pb-14 sm:pt-14 sm:pb-[72px] lg:pt-16">
          <div className="min-w-0 flex-[1_1_500px]">
            <p className="mb-6 text-[15px] text-on-navy">High School for the Gifted VNUHCM</p>
            <h1 className="mb-6 max-w-[620px] text-[36px] sm:text-[46px] lg:text-[56px] font-bold leading-[1.05] tracking-[-0.035em]">
              A student-led community building real things with AI.
            </h1>
            <p className="mb-9 max-w-[540px] text-lg leading-relaxed text-on-navy">
              Run by PTNK students, for students. We ship tools our classmates actually use, run AI contests on our own
              platform, and teach short courses for anyone who wants to start.
            </p>
            <div className="flex flex-wrap items-center gap-3.5">
              <Link
                href="/products"
                className="inline-flex min-h-[50px] items-center gap-2.5 rounded-md bg-white px-[22px] font-semibold text-navy-dark transition-colors hover:bg-on-navy"
              >
                See what we&apos;ve built
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#join"
                className="inline-flex min-h-[50px] items-center rounded-md border border-white/55 px-[22px] font-semibold text-white transition-colors hover:border-white"
              >
                How to join
              </a>
            </div>
          </div>

          {heroFigure && (
            <figure className="m-0 min-w-0 flex-[1_1_520px]">
              {/* 16:9 frame matches the source screenshots, so nothing is cropped. */}
              <div className="relative aspect-video overflow-hidden rounded-lg ring-1 ring-white/25">
                <Image
                  src={heroFigure.src}
                  alt={heroFigure.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 text-sm text-on-navy">
                {heroFigure.href ? (
                  <>
                    {heroFigure.caption} —{' '}
                    <Link href={heroFigure.href} className="text-white underline underline-offset-[3px] hover:text-on-navy">
                      read it
                    </Link>
                  </>
                ) : (
                  heroFigure.caption
                )}
              </figcaption>
            </figure>
          )}
        </Container>

        <Container>
          <dl className="grid grid-cols-2 border-t border-white/[0.22] sm:grid-cols-3 lg:grid-cols-5">
            {facts.map((fact) => (
              <div key={fact.label} className="flex flex-col-reverse gap-2 pt-7 pb-8 pr-5">
                <dt className="text-sm leading-snug text-on-navy">{fact.label}</dt>
                <dd className="font-mono text-[36px] font-medium leading-none tracking-[-0.02em] text-white">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* What we do */}
      <section className="pt-20 sm:pt-28">
        <Container>
          <SectionTitle className="mb-12 max-w-[640px]">Three things we do, and proof that we do them.</SectionTitle>
          <div className="grid grid-cols-1 gap-x-12 md:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.title} className="flex flex-col gap-3.5 border-t-2 border-link pt-[22px] pb-8">
                <h3 className="text-2xl font-bold tracking-[-0.015em] text-text-primary">{p.title}</h3>
                <p className="text-text-secondary leading-relaxed">{p.body}</p>
                <TextLink href={p.href} className="mt-auto text-[15px]">
                  {p.link} →
                </TextLink>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured story */}
      <section className="pt-16 sm:pt-24">
        <Container>
          <article className="flex flex-wrap items-center gap-12 rounded-[10px] bg-paper p-5 sm:p-8 lg:p-10">
            <div className="relative aspect-video min-w-0 flex-[1_1_480px] overflow-hidden rounded-md">
              <Image
                src={paic.coverImage}
                alt={`${paic.title} on The Noders competition platform`}
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-[18px]">
              <p className="text-sm text-text-secondary">Contest recap</p>
              <h2 className="text-[26px] sm:text-[34px] font-bold leading-[1.15] tracking-[-0.02em] text-text-primary">
                {paic.shortName}: 54 students tried to grade IELTS essays with AI
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Two weeks, 891 submissions, one metric — mean absolute error against real examiner scores. The private
                test set decided it.
              </p>
              <table className="w-full border-collapse text-[15px]">
                <caption className="pb-2 text-left text-[13px] text-text-tertiary">
                  Final standings · average MAE, lower is better
                </caption>
                <tbody>
                  {paic.standings.rows.slice(0, 3).map((row, i) => (
                    <tr key={row.name} className="border-t border-dark-border">
                      <td className={cn('w-10 py-[11px] font-mono', i === 0 ? 'text-link' : 'text-text-tertiary')}>
                        {String(i + 1).padStart(2, '0')}
                      </td>
                      <td className="py-[11px] font-semibold text-text-primary">{row.name}</td>
                      <td className="py-[11px] text-right font-mono text-text-secondary">{row.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex flex-wrap gap-x-6 gap-y-3 text-[15px] font-semibold">
                {paic.postSlug && <TextLink href={`/posts/${paic.postSlug}`}>Read the recap →</TextLink>}
                <Link href={`/contest/${paic.slug}`} className="text-text-primary hover:text-link transition-colors">
                  Full leaderboard
                </Link>
              </div>
            </div>
          </article>
        </Container>
      </section>

      {/* Products */}
      {projects.length > 0 && (
        <section className="pt-20 sm:pt-28">
          <Container>
            <SectionHeader title="Recently shipped" href="/products" linkLabel={`All ${projectsCount} products`} />
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {projects.map((p) => (
                <Link key={p.id} href={`/products/${p.id}`} className="group flex flex-col gap-3">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-paper">
                    {projectImage(p) && (
                      <Image
                        src={projectImage(p)!}
                        alt={p.thumbnail_image?.alt_text || `${p.title} screenshot`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <h3 className="mt-1.5 text-[19px] font-bold tracking-[-0.01em] text-text-primary group-hover:text-link transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-text-secondary line-clamp-3">{p.description}</p>
                  {p.tech_stack && p.tech_stack.length > 0 && (
                    <span className="text-[13px] text-text-tertiary">{p.tech_stack.slice(0, 3).join(' · ')}</span>
                  )}
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Writing */}
      {posts.length > 0 && (
        <section className="pt-20 sm:pt-28">
          <Container>
            <SectionHeader title="Writing" href="/posts" linkLabel="All posts" className="mb-5" />
            <ul className="border-b border-rule">
              {posts.slice(0, 5).map((post) => (
                <li key={post.id} className="border-t border-rule">
                  <Link href={`/posts/${post.slug}`} className="group flex flex-wrap items-baseline gap-x-8 gap-y-1.5 py-[22px]">
                    <Mono className="flex-[0_0_120px]">{formatDate(post.published_at || post.created_at)}</Mono>
                    <span className="min-w-0 flex-[1_1_480px] text-[19px] font-semibold leading-snug tracking-[-0.01em] text-text-primary group-hover:text-link transition-colors">
                      {cleanTitle(post.title)}
                    </span>
                    <span className="text-sm text-text-tertiary">
                      {[post.author?.full_name, post.reading_time ? `${post.reading_time} min` : null].filter(Boolean).join(' · ')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* People */}
      {members.length > 0 && (
        <section id="people" className="pt-20 sm:pt-28">
          <Container>
            <div className="flex flex-wrap gap-x-16 gap-y-8">
              <div className="min-w-0 flex-[1_1_300px]">
                <SectionTitle className="mb-4">The people</SectionTitle>
                <p className="mb-5 text-text-secondary leading-relaxed">
                  Students who code, write, teach and run contests. Everything on this site was made by someone on this
                  list.
                </p>
                <p className="flex items-center gap-2 text-sm text-text-tertiary">
                  <span className="inline-block h-2 w-2 rounded-full bg-link" />
                  Core team
                </p>
              </div>
              <ul className="grid min-w-0 flex-[2_1_560px] grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-x-8">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center gap-2.5 border-t border-rule py-3 text-[15px]">
                    <span
                      className={cn('inline-block h-2 w-2 shrink-0 rounded-full', m.role === 'admin' ? 'bg-link' : 'bg-control')}
                      aria-hidden="true"
                    />
                    <Link href={`/members/${m.id}`} className="truncate text-text-primary hover:text-link transition-colors">
                      {m.full_name || m.username}
                    </Link>
                    {m.role === 'admin' && <span className="sr-only">(core team)</span>}
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>
      )}

      {/* Join — a grey panel on the page ground, kept apart from the navy footer */}
      <section id="join" className="py-20 sm:py-28">
        <Container>
          <div className="flex flex-wrap gap-x-16 gap-y-10 rounded-xl bg-paper p-7 sm:p-10 lg:p-14">
            <div className="min-w-0 flex-[1_1_360px]">
              <h2 className="mb-4 text-[32px] sm:text-[40px] lg:text-[48px] font-bold leading-[1.05] tracking-[-0.03em] text-text-primary">
                Want in?
              </h2>
              <p className="mb-7 max-w-[440px] text-lg text-text-secondary">
                No experience required — our workshops and contests are built for beginners too.
              </p>
              <div className="flex flex-wrap gap-3">
                <PrimaryLink href="/contact">Contact us</PrimaryLink>
                <SecondaryLink href={SOCIAL_LINKS.facebook} external>
                  Follow on Facebook
                </SecondaryLink>
              </div>
            </div>
            <ol className="flex min-w-0 flex-[1_1_420px] flex-col">
              {steps.map((s) => (
                <li key={s.n} className="flex gap-5 border-t border-[#2A2E37] py-[18px]">
                  <Mono className="pt-[3px] text-link">{s.n}</Mono>
                  <div>
                    <div className="text-[17px] font-semibold text-text-primary">{s.title}</div>
                    <div className="text-[15px] text-text-secondary">{s.body}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>
    </>
  )
}
