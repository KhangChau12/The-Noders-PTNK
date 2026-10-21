import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Avatar } from '@/components/Avatar'
import { Container, NavyFacts, SectionTitle } from '@/components/editorial'
import { MembersDirectory, type DirectoryMember } from '@/components/members/MembersDirectory'
import { activitySummary, roleTitle } from '@/lib/memberSummary'

interface ProfileRow {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  bio: string | null
  role: 'admin' | 'member'
  contest_count: number | null
}

async function getMembers() {
  const supabase = createClient()
  const [profiles, posts, credits, projects] = await Promise.all([
    supabase.from('profiles').select('id, full_name, username, avatar_url, bio, role, contest_count'),
    supabase.from('posts').select('author_id').eq('status', 'published'),
    supabase.from('project_contributors').select('user_id'),
    supabase.from('projects').select('id', { count: 'exact', head: true }).in('status', ['active', 'completed']),
  ])

  const count = (rows: any[] | null, key: string) =>
    (rows || []).reduce<Record<string, number>>((acc, r) => ((acc[r[key]] = (acc[r[key]] || 0) + 1), acc), {})
  const postsBy = count(posts.data, 'author_id')
  const productsBy = count(credits.data, 'user_id')

  const members = ((profiles.data as ProfileRow[]) || []).map((p) => {
    const stats = { products: productsBy[p.id] || 0, posts: postsBy[p.id] || 0, contests: p.contest_count || 0 }
    return { ...p, name: p.full_name || p.username || 'Member', ...stats }
  })

  return {
    members,
    totalPosts: (posts.data || []).length,
    totalProducts: projects.count || 0,
  }
}


export default async function MembersPage() {
  const { members, totalPosts, totalProducts } = await getMembers()
  const competed = members.filter((m) => m.contests > 0).length
  const leads = members
    .filter((m) => m.role === 'admin')
    .map((m) => ({ ...m, title: roleTitle(m.bio, m.role) }))
    // Founder first, then heads, then the rest of the core team.
    .sort((a, b) => rankTitle(a.title) - rankTitle(b.title) || a.name.localeCompare(b.name))

  const directory: DirectoryMember[] = members.map((m) => ({
    id: m.id,
    name: m.name,
    avatar: m.avatar_url || null,
    products: m.products,
    posts: m.posts,
    contests: m.contests,
    summary: activitySummary(m),
  }))

  return (
    <div>
      <section className="bg-navy text-white">
        <Container className="pt-14">
          <p className="mb-4 text-[15px] text-on-navy">Members</p>
          <h1 className="mb-4 max-w-[760px] text-[32px] sm:text-[40px] lg:text-[50px] font-bold leading-[1.06] tracking-[-0.03em]">
            {members.length} students. Everything on this site, they made.
          </h1>
          <p className="max-w-[620px] text-lg text-on-navy">
            Each profile shows what that person actually shipped — products, posts and contest results — so you can see who to ask about what.
          </p>
          <NavyFacts
            className="mt-10"
            facts={[
              { value: members.length, label: 'members' },
              { value: totalProducts, label: 'products shipped' },
              { value: totalPosts, label: 'posts written' },
              { value: competed, label: 'took part in a contest' },
            ]}
          />
        </Container>
      </section>

      {leads.length > 0 && (
        <section className="pt-20">
          <Container>
            <SectionTitle className="mb-2">Who leads what</SectionTitle>
            <p className="mb-7 text-text-secondary">Reach out to the person who owns the area you care about.</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {leads.map((m) => (
                <Link key={m.id} href={`/members/${m.id}`} className="group grid grid-cols-[56px_1fr] items-center gap-4 rounded-xl bg-paper px-5 py-[18px] transition-colors hover:bg-[#1A1E26]">
                  <Avatar src={m.avatar_url} name={m.name} size="lg" className="h-14 w-14" />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-link">{m.title}</span>
                    <span className="block truncate text-[17px] font-bold leading-snug text-text-primary group-hover:text-link transition-colors">{m.name}</span>
                    <span className="block truncate text-sm text-text-tertiary">{activitySummary(m) || 'No public work yet'}</span>
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="pt-24 pb-20 sm:pb-28">
        <Container>
          <MembersDirectory members={directory} />
        </Container>
      </section>
    </div>
  )
}

function rankTitle(t: string) {
  if (t === 'Founder') return 0
  if (t === 'Co-founder') return 1
  if (t.startsWith('Head of')) return 2
  return 3
}
