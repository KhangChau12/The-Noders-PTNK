'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useMember } from '@/lib/hooks'
import { postQueries } from '@/lib/queries'
import { Loading } from '@/components/Loading'
import { Avatar } from '@/components/Avatar'
import { useToast } from '@/components/Toast'
import { Breadcrumb, Container, FilterButton, NavyFacts, PrimaryLink } from '@/components/editorial'
import { SITE_CONFIG } from '@/lib/constants'
import { contestResultsFor } from '@/lib/programs'
import { activityLine, isDefaultBio, ordinal, roleTitle } from '@/lib/memberSummary'
import { EMPTY_TERMS, fetchTermsData, generationOf, isAdvisorOnly, roleHistory, roleLine, type TermsData } from '@/lib/terms'
import { cn } from '@/lib/utils'

interface Certificate {
  id: string
  certificate_id: string
  title: string
  issued_at: string
}

type Kind = 'product' | 'post' | 'contest'

interface WorkItem {
  kind: Kind
  date: string
  title: string
  meta: string
  href: string
  image?: string | null
}

const KIND_STYLE: Record<Kind, { label: string; text: string; dot: string; size: string }> = {
  product: { label: 'Built a product', text: 'text-link', dot: 'bg-link', size: 'text-lg' },
  post: { label: 'Wrote', text: 'text-text-tertiary', dot: 'bg-[#4A5060]', size: 'text-base' },
  contest: { label: 'Competed', text: 'text-[#E0B26A]', dot: 'bg-[#BD8532]', size: 'text-lg' },
}

const CATEGORY_LABEL: Record<string, string> = {
  'Community Activities': 'Community',
  News: 'News',
  'You may want to know': 'Do you know?',
  'Tech Sharing': 'Tech sharing',
  'Member Spotlight': 'Member spotlight',
}

const SOCIAL_LABEL: Record<string, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  twitter: 'X / Twitter',
  website: 'Website',
}

const monthKey = (iso: string) => iso.slice(0, 7)
const monthLabel = (key: string) =>
  new Date(`${key}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })

export default function MemberProfilePage() {
  const params = useParams()
  const id = params.id as string
  const { showToast } = useToast()

  const { member, loading, error } = useMember(id)
  const [posts, setPosts] = useState<any[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [filter, setFilter] = useState<'all' | Kind>('all')
  const [terms, setTerms] = useState<TermsData>(EMPTY_TERMS)

  useEffect(() => {
    const fetchData = async () => {
      if (!member?.id) return
      try {
        const supabase = createClient()
        const [{ posts: fetchedPosts, error: postsError }, { data: certs }, termsData] = await Promise.all([
          postQueries.getUserPosts(member.id),
          supabase
            .from('certificates')
            .select('id, certificate_id, title, issued_at')
            .eq('user_id', member.id)
            .order('issued_at', { ascending: false }),
          fetchTermsData(supabase),
        ])
        if (!postsError && fetchedPosts) setPosts(fetchedPosts.filter((p: any) => p.status === 'published'))
        if (certs) setCertificates(certs)
        setTerms(termsData)
      } catch (fetchError) {
        console.error('Error fetching member detail data:', fetchError)
      }
    }
    fetchData()
  }, [member?.id])

  const contributions = useMemo(
    () => ((member?.contributed_projects as any[]) || []).map((c) => ({ ...c, project: c.projects || c.project })).filter((c) => c.project),
    [member]
  )
  const results = useMemo(() => contestResultsFor(member?.full_name), [member?.full_name])

  const items = useMemo<WorkItem[]>(() => {
    const out: WorkItem[] = []
    contributions.forEach((c) =>
      out.push({
        kind: 'product',
        date: c.project.created_at,
        title: c.project.title,
        meta: [c.contribution_percentage === 100 ? 'Sole builder' : `${c.contribution_percentage}% of the build`, c.role_in_project && c.role_in_project !== 'Contributor' ? c.role_in_project : null]
          .filter(Boolean)
          .join(' · '),
        href: `/products/${c.project.id}`,
        image: c.project.thumbnail_url,
      })
    )
    posts.forEach((p) =>
      out.push({
        kind: 'post',
        date: p.published_at || p.created_at,
        title: p.title,
        meta: CATEGORY_LABEL[p.category] ?? p.category,
        href: `/posts/${p.slug}`,
      })
    )
    results.forEach((r) =>
      out.push({
        kind: 'contest',
        date: r.contest.endedISO,
        title: `${r.contest.title} — ${ordinal(r.rank)} of ${r.of}`,
        meta: `MAE ${r.score.toFixed(4)} · ${r.submissions} submission${r.submissions === 1 ? '' : 's'}`,
        href: `/contest/${r.contest.slug}`,
      })
    )
    return out.sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [contributions, posts, results])

  if (loading) {
    return <Loading text="Loading profile" />
  }

  if (error || !member || (terms.ready && isAdvisorOnly(terms, member.id))) {
    return (
      <Container className="py-24">
        <h1 className="mb-3 text-3xl font-bold text-text-primary">Member not found</h1>
        <p className="mb-6 text-text-secondary">The profile you&apos;re looking for doesn&apos;t exist.</p>
        <PrimaryLink href="/members">Back to members</PrimaryLink>
      </Container>
    )
  }

  const name = member.full_name || member.username || 'Member'
  const title = terms.ready ? roleLine(terms, member.id) : roleTitle(member.bio, member.role)
  const generation = terms.ready ? generationOf(terms, member.id) : null
  const history = terms.ready ? roleHistory(terms, member.id) : []
  const best = results.slice().sort((a, b) => a.rank - b.rank)[0]
  const stats = { products: contributions.length, posts: posts.length, contests: member.contest_count || 0 }
  const autoLine = activityLine(stats, best ? { rank: best.rank, contest: best.contest.shortName } : null)
  const socialLinks = Object.entries((member.social_links || {}) as Record<string, string>).filter(([, url]) => !!url)
  const taskStats: { task_name: string; repetitions: number; total_points: number }[] = (member as any).task_stats || []
  const totalPoints: number = (member as any).total_points || 0
  const shown = filter === 'all' ? items : items.filter((i) => i.kind === filter)
  const groups = shown.reduce<{ key: string; items: WorkItem[] }[]>((acc, item) => {
    const key = monthKey(item.date)
    const last = acc[acc.length - 1]
    if (last && last.key === key) last.items.push(item)
    else acc.push({ key, items: [item] })
    return acc
  }, [])

  const facts = [
    { value: stats.products, label: stats.products === 1 ? 'product built' : 'products built' },
    { value: stats.posts, label: stats.posts === 1 ? 'post written' : 'posts written' },
    best ? { value: `#${best.rank}`, label: best.contest.shortName } : { value: stats.contests, label: 'contests' },
    { value: certificates.length, label: certificates.length === 1 ? 'certificate' : 'certificates' },
  ]

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${SITE_CONFIG.url}/members/${member.id}`)
      showToast('success', 'Profile link copied')
    } catch {
      showToast('error', 'Could not copy the link')
    }
  }

  return (
    <div>
      {/* Navy intro: who they are, in their words and in their data */}
      <section className="bg-navy text-white">
        <Container className="pt-11">
          <Breadcrumb items={[{ label: 'Members', href: '/members' }, { label: name }]} />
          <div className="flex flex-wrap items-end gap-x-10 gap-y-7">
            {member.avatar_url ? (
              <Image src={member.avatar_url} alt={name} width={144} height={144} className="h-36 w-36 rounded-2xl object-cover" priority />
            ) : (
              <Avatar name={name} size="2xl" className="h-36 w-36 rounded-2xl text-4xl" />
            )}
            <div className="min-w-0 flex-[1_1_440px]">
              <p className="mb-2 text-[15px] text-on-navy">
                {[title, !generation ? `Member since ${new Date(member.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}` : null]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <h1 className="mb-3 text-[34px] sm:text-[44px] lg:text-[54px] font-bold leading-[1.04] tracking-[-0.035em]">{name}</h1>
              {!isDefaultBio(member.bio) && <p className="mb-2 max-w-[560px] text-lg text-white">{member.bio}</p>}
              {autoLine && <p className="max-w-[560px] text-base text-on-navy">{autoLine}</p>}
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button type="button" onClick={copyLink} className="min-h-[44px] rounded-md bg-white px-4 text-[15px] font-semibold text-navy-dark transition-colors hover:bg-on-navy">
                Copy profile link
              </button>
              {socialLinks.map(([key, url]) => (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center rounded-md border border-white/55 px-4 text-[15px] font-semibold text-white transition-colors hover:border-white">
                  {SOCIAL_LABEL[key] ?? key} ↗
                </a>
              ))}
            </div>
          </div>
          {history.length > 0 && (
            <div className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-white/20 pt-5">
              <span className="text-sm text-on-navy">Roles in the club</span>
              <ol className="flex flex-wrap gap-x-6 gap-y-1.5 text-[15px]">
                {history.map((r, i) => (
                  <li key={i}>
                    <span className="font-semibold">{r.label}</span>
                    {r.term && <span className="text-on-navy"> · {r.term}{r.current ? ' (now)' : ''}</span>}
                  </li>
                ))}
              </ol>
            </div>
          )}
          <NavyFacts facts={facts} className="mt-8" />
        </Container>
      </section>

      <Container className="flex flex-wrap items-start gap-x-16 gap-y-12 pt-16 pb-20 sm:pb-28">
        {/* Work timeline */}
        <main className="min-w-0 flex-[1_1_640px]">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-bold leading-[1.15] tracking-[-0.025em] text-text-primary">Work</h2>
            {items.length > 0 && (
              <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
                {(['all', 'product', 'post', 'contest'] as const).map((k) => {
                  const count = k === 'all' ? items.length : items.filter((i) => i.kind === k).length
                  if (k !== 'all' && count === 0) return null
                  return (
                    <FilterButton key={k} active={filter === k} onClick={() => setFilter(k)}>
                      {k === 'all' ? 'All' : k === 'product' ? 'Products' : k === 'post' ? 'Posts' : 'Contests'}{' '}
                      <span className="font-mono text-xs opacity-75">{count}</span>
                    </FilterButton>
                  )
                })}
              </div>
            )}
          </div>

          {items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#2A2E37] px-6 py-10 text-text-secondary">
              Nothing public yet. Products, posts and contest results will show up here as {name.split(' ').slice(-1)[0]} ships them.
            </p>
          ) : (
            <ol>
              {groups.map((g) => (
                <li key={g.key} className="grid grid-cols-[80px_1fr] gap-x-6 sm:grid-cols-[96px_1fr]">
                  <span className="self-start pt-[18px] font-mono text-[13px] text-text-tertiary lg:sticky lg:top-[90px]">{monthLabel(g.key)}</span>
                  <ul className="border-l border-[#2A2E37] pb-3">
                    {g.items.map((it, i) => {
                      const k = KIND_STYLE[it.kind]
                      return (
                        <li key={`${it.href}-${i}`} className="relative py-3.5 pl-6">
                          <span aria-hidden="true" className={cn('absolute -left-[5px] top-6 h-[9px] w-[9px] rounded-full ring-[3px] ring-ink', k.dot)} />
                          <Link href={it.href} className="group flex items-center gap-4">
                            {it.image && (
                              <span className="relative hidden aspect-[16/10] w-28 flex-none overflow-hidden rounded-lg bg-paper sm:block">
                                <Image src={it.image} alt="" fill sizes="112px" className="object-cover" />
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className={cn('block text-[13px] font-semibold', k.text)}>{k.label}</span>
                              <span className={cn('block font-bold leading-snug text-text-primary transition-colors group-hover:text-link', k.size)}>{it.title}</span>
                              <span className="block text-sm text-text-tertiary">{it.meta}</span>
                            </span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              ))}
            </ol>
          )}
        </main>

        <aside className="flex min-w-0 flex-[0_1_340px] flex-col gap-5 lg:sticky lg:top-[100px]">
          <div className="rounded-xl bg-paper p-6">
            <h2 className="mb-1 text-[17px] font-bold text-text-primary">Certificates</h2>
            <p className="mb-4 text-sm text-text-tertiary">Issued by The Noders. Anyone can check them with the code.</p>
            {certificates.length === 0 ? (
              <p className="border-t border-[#2A2E37] pt-3.5 text-sm text-text-secondary">None yet.</p>
            ) : (
              <ul className="flex flex-col">
                {certificates.map((c) => (
                  <li key={c.id} className="flex flex-col gap-1.5 border-t border-[#2A2E37] py-3.5">
                    <span className="font-semibold leading-snug text-text-primary">{c.title}</span>
                    <span className="text-sm text-text-tertiary">
                      Issued {new Date(c.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="mt-1 flex items-center justify-between">
                      <span className="rounded bg-ink px-2 py-0.5 font-mono text-sm text-[#C9CED8]">{c.certificate_id}</span>
                      <Link href={`/verify/${c.certificate_id}`} className="text-sm font-semibold text-link hover:text-text-primary">Verify →</Link>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {taskStats.length > 0 && (
            <div className="rounded-xl bg-paper p-6">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-[17px] font-bold text-text-primary">Club activity</h2>
                <span className="font-mono text-sm text-link">{totalPoints} pts</span>
              </div>
              <table className="w-full border-collapse text-sm">
                <thead className="sr-only">
                  <tr><th scope="col">Task</th><th scope="col">Times</th><th scope="col">Points</th></tr>
                </thead>
                <tbody>
                  {taskStats.map((t) => (
                    <tr key={t.task_name} className="border-t border-[#2A2E37]">
                      <td className="py-2.5 pr-3 text-[#C9CED8]">{t.task_name}</td>
                      <td className="py-2.5 text-right font-mono text-text-tertiary">×{t.repetitions}</td>
                      <td className="py-2.5 pl-3 text-right font-mono text-text-primary">{t.total_points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </aside>
      </Container>
    </div>
  )
}
