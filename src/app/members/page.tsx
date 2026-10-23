import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Container, NavyFacts, SectionTitle } from '@/components/editorial'
import { MembersDirectory, type DirectoryMember } from '@/components/members/MembersDirectory'
import { activitySummary, roleTitle } from '@/lib/memberSummary'
import { formatMonth } from '@/lib/dashboard'
import { KIND_RANK, LEADING, currentTerm, fetchTermsData, positionLabel, type Position, type Term, type TermsData } from '@/lib/terms'
import { cn } from '@/lib/utils'

interface ProfileRow {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  bio: string | null
  role: 'admin' | 'member'
  contest_count: number | null
}

async function getData() {
  const supabase: any = createClient()
  const [profiles, posts, credits, projects, terms] = await Promise.all([
    supabase.from('profiles').select('id, full_name, username, avatar_url, bio, role, contest_count'),
    supabase.from('posts').select('author_id').eq('status', 'published'),
    supabase.from('project_contributors').select('user_id'),
    supabase.from('projects').select('id', { count: 'exact', head: true }).in('status', ['active', 'completed']),
    fetchTermsData(supabase),
  ])
  const count = (rows: any[] | null, key: string) =>
    (rows || []).reduce<Record<string, number>>((acc, r) => ((acc[r[key]] = (acc[r[key]] || 0) + 1), acc), {})
  const postsBy = count(posts.data, 'author_id')
  const productsBy = count(credits.data, 'user_id')
  const members = ((profiles.data as ProfileRow[]) || []).map((p) => ({
    ...p,
    name: p.full_name || p.username || 'Member',
    products: productsBy[p.id] || 0,
    posts: postsBy[p.id] || 0,
    contests: p.contest_count || 0,
  }))
  return { members, totalPosts: (posts.data || []).length, totalProducts: projects.count || 0, terms: terms as TermsData }
}

type Member = Awaited<ReturnType<typeof getData>>['members'][number]

function Face({ src, name, className }: { src?: string | null; name: string; className: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={cn('shrink-0 object-cover', className)} />
  }
  const initials = name.split(' ').filter(Boolean).map((w) => w[0]).slice(-2).join('').toUpperCase()
  return <span aria-hidden="true" className={cn('inline-flex shrink-0 items-center justify-center bg-[#2A4B8D] font-semibold text-white', className)}>{initials}</span>
}

const termRange = (t: Term) =>
  t.starts_on ? `${formatMonth(t.starts_on)}${t.ends_on ? ` – ${formatMonth(t.ends_on)}` : t.is_current ? ' – now' : ''}` : t.is_current ? 'current' : ''

export default async function MembersPage({ searchParams }: { searchParams: Promise<{ term?: string }> }) {
  const { term: termParam } = await searchParams
  const { members, totalPosts, totalProducts, terms: all } = await getData()
  // A term that hasn't started yet (being set up, or a start that failed) stays off the public page
  const started = currentTerm(all)
  const terms = { ...all, terms: all.terms.filter((t) => !started || t.is_current || t.number < started.number) }
  const byId = new Map(members.map((m) => [m.id, m]))
  const competed = members.filter((m) => m.contests > 0).length

  const cur = currentTerm(terms)
  const term = terms.terms.find((t) => String(t.number) === termParam) || cur
  const inTerm = term ? terms.positions.filter((p) => p.term_id === term.id) : []
  const founders = terms.positions.filter((p) => p.kind === 'founder')
  const advisors = inTerm.filter((p) => p.kind === 'advisor')
  const leaders = inTerm.filter((p) => LEADING.includes(p.kind)).sort((a, b) => KIND_RANK[a.kind] - KIND_RANK[b.kind] || positionLabel(a, terms).localeCompare(positionLabel(b, terms)))

  // Directory: everyone in the selected term except advisors (before 028: everyone)
  const termPeople = terms.ready && term
    ? Array.from(new Set(inTerm.filter((p) => p.kind !== 'advisor' && p.profile_id).map((p) => p.profile_id!))).map((id) => byId.get(id)).filter(Boolean) as Member[]
    : members
  const alumni = terms.ready && term?.is_current
    ? members.filter((m) => !inTerm.some((p) => p.profile_id === m.id) && terms.positions.some((p) => p.profile_id === m.id && p.term_id && p.kind !== 'advisor'))
    : []

  const directory: DirectoryMember[] = termPeople.map((m) => ({
    id: m.id,
    name: m.name,
    avatar: m.avatar_url || null,
    products: m.products,
    posts: m.posts,
    contests: m.contests,
    summary: activitySummary(m),
  }))

  const person = (p: Position) => {
    const m = p.profile_id ? byId.get(p.profile_id) : undefined
    return { name: m?.name || p.display_name || 'Unknown', avatar: p.avatar_url || m?.avatar_url || null, href: m ? `/members/${m.id}` : null, member: m }
  }
  const founderAlsoLeads = (id?: string | null) => (id ? inTerm.filter((p) => p.profile_id === id && LEADING.includes(p.kind)).map((p) => positionLabel(p, terms)) : [])

  // Before migration 028: keep the old "who leads what" guess from bios
  const legacyLeads = terms.ready ? [] : members.filter((m) => m.role === 'admin').map((m) => ({ ...m, title: roleTitle(m.bio, m.role) }))

  return (
    <div>
      <section className="bg-navy text-white">
        <Container className="pt-14">
          <div className="flex flex-wrap items-end gap-x-16 gap-y-8">
            <div className="min-w-0 flex-[1_1_560px]">
              <p className="mb-4 text-[15px] text-on-navy">Members</p>
              <h1 className="mb-4 max-w-[760px] text-[32px] font-bold leading-[1.06] tracking-[-0.03em] sm:text-[40px] lg:text-[50px]">
                The people who run The Noders, term by term.
              </h1>
              <p className="max-w-[620px] text-lg text-on-navy">
                Each term has its own president, heads and members. Earlier terms stay here, so everyone keeps the role they held.
              </p>
            </div>
            {terms.terms.length > 0 && (
              <nav aria-label="Terms" className="flex min-w-0 flex-[0_1_320px] flex-col gap-1.5">
                <span className="mb-1 text-sm text-on-navy">Showing</span>
                {terms.terms.map((t) => {
                  const on = t.id === term?.id
                  return (
                    <Link
                      key={t.id}
                      href={t.is_current ? '/members' : `/members?term=${t.number}`}
                      aria-current={on ? 'page' : undefined}
                      scroll={false}
                      className={cn(
                        'flex min-h-[48px] items-center justify-between gap-3 rounded-lg border px-4 text-[15px] font-semibold',
                        on ? 'border-white/60 bg-white/[0.12]' : 'border-white/25 hover:border-white/50'
                      )}
                    >
                      {t.name}
                      <span className="text-[13px] font-normal text-on-navy">{[termRange(t), t.is_current ? 'current' : ''].filter(Boolean).join(' · ')}</span>
                    </Link>
                  )
                })}
              </nav>
            )}
          </div>
          <NavyFacts
            className="mt-10"
            facts={[
              { value: termPeople.length, label: term ? `members in ${term.name}` : 'members' },
              { value: totalProducts, label: 'products shipped' },
              { value: totalPosts, label: 'posts written' },
              { value: competed, label: 'took part in a contest' },
            ]}
          />
        </Container>
      </section>

      {(founders.length > 0 || advisors.length > 0) && (
        <Container className="flex flex-wrap gap-5 pt-14">
          {founders.map((f) => {
            const x = person(f)
            const also = founderAlsoLeads(f.profile_id)
            return (
              <Link key={f.id} href={x.href || '#'} className="flex min-w-0 flex-[1_1_380px] items-center gap-[18px] rounded-xl bg-paper px-[22px] py-5 transition-colors hover:bg-[#1A1E26]">
                <Face src={x.avatar} name={x.name} className="h-[72px] w-[72px] rounded-[14px] text-xl" />
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-link">Founder{terms.terms.length ? ` · since ${formatMonth(terms.terms[terms.terms.length - 1].starts_on)}` : ''}</span>
                  <span className="block text-xl font-bold">{x.name}</span>
                  {also.length > 0 && term && <span className="block text-sm text-text-tertiary">Also {also.join(', ')} in {term.name}</span>}
                </span>
              </Link>
            )
          })}
          {advisors.map((a) => {
            const x = person(a)
            const inner = (
              <>
                <Face src={x.avatar} name={x.name} className="h-[72px] w-[72px] rounded-[14px] text-xl" />
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-[#E0B26A]">Advisor · {term?.name}</span>
                  <span className="block text-xl font-bold">{x.name}</span>
                  {a.display_title && <span className="block text-sm text-text-tertiary">{a.display_title}</span>}
                </span>
              </>
            )
            return (
              <div key={a.id} className="flex min-w-0 flex-[1_1_380px] items-center gap-[18px] rounded-xl border border-[#2A2E37] px-[22px] py-5">{inner}</div>
            )
          })}
        </Container>
      )}

      {leaders.length > 0 && term && (
        <section className="pt-14">
          <Container>
            <SectionTitle className="mb-2">{term.name} leadership</SectionTitle>
            <p className="mb-7 text-text-secondary">President and the heads of each department{term.starts_on ? ` since ${formatMonth(term.starts_on)}` : ''}. Reach out to whoever owns the area you care about.</p>
            <div data-stagger className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {leaders.map((p) => {
                const x = person(p)
                return (
                  <Link key={p.id} href={x.href || '#'} className="lift group grid grid-cols-[56px_1fr] items-center gap-4 rounded-xl bg-paper px-5 py-[18px] transition-colors hover:bg-[#1A1E26]">
                    <Face src={x.avatar} name={x.name} className="h-14 w-14 rounded-full" />
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold text-link">{positionLabel(p, terms)}</span>
                      <span className="block truncate text-[17px] font-bold leading-snug text-text-primary transition-colors group-hover:text-link">{x.name}</span>
                      <span className="block truncate text-sm text-text-tertiary">{(x.member && activitySummary(x.member)) || 'No public work yet'}</span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </Container>
        </section>
      )}

      {legacyLeads.length > 0 && (
        <section className="pt-20">
          <Container>
            <SectionTitle className="mb-7">Who leads what</SectionTitle>
            <div data-stagger className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {legacyLeads.map((m) => (
                <Link key={m.id} href={`/members/${m.id}`} className="lift grid grid-cols-[56px_1fr] items-center gap-4 rounded-xl bg-paper px-5 py-[18px] hover:bg-[#1A1E26]">
                  <Face src={m.avatar_url} name={m.name} className="h-14 w-14 rounded-full" />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-link">{m.title}</span>
                    <span className="block truncate text-[17px] font-bold">{m.name}</span>
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="pb-20 pt-20 sm:pb-28">
        <Container>
          <MembersDirectory members={directory} />
        </Container>
      </section>

      {alumni.length > 0 && (
        <section className="pb-24">
          <Container>
            <SectionTitle className="mb-2">Alumni</SectionTitle>
            <p className="mb-6 text-text-secondary">Members of earlier terms. Their roles stay on their profiles.</p>
            <ul data-stagger className="grid gap-x-4 gap-y-2 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
              {alumni.map((m) => (
                <li key={m.id} className="border-b border-rule">
                  <Link href={`/members/${m.id}`} className="flex items-center gap-3 py-2.5 font-semibold text-text-primary hover:text-link">
                    <Face src={m.avatar_url} name={m.name} className="h-9 w-9 rounded-full text-xs" />
                    {m.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </div>
  )
}
