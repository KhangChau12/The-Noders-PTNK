'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useProject, useProjects } from '@/lib/hooks'
import { Loading } from '@/components/Loading'
import { Avatar } from '@/components/Avatar'
import {
  Breadcrumb,
  Container,
  NavyPrimaryLink,
  NavySecondaryLink,
  PrimaryLink,
  SectionHeader,
  VideoPlayer,
} from '@/components/editorial'

function monthYear(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

function hostOf(url?: string | null) {
  if (!url) return null
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

/** Drop the empty <div>s and stray \r the old rich-text editor left behind. */
function cleanDetails(html: string) {
  return html
    .replace(/\r/g, '')
    .replace(/\s*bis_skin_checked="1"/g, '')
    .replace(/<div>\s*(<br\s*\/?>)?\s*<\/div>/g, '')
    .trim()
}

const imageOf = (p: any) => p?.thumbnail_image?.public_url || p?.thumbnail_url || null

export default function ProjectDetailPage() {
  const params = useParams()
  const { project, loading, error } = useProject(params.id as string)
  const { projects: all } = useProjects({})

  if (loading) return <Loading />

  if (error || !project) {
    return (
      <Container className="py-24">
        <h1 className="mb-3 text-3xl font-bold text-text-primary">Product not found</h1>
        <p className="mb-6 text-text-secondary">It may have been removed or the link is wrong.</p>
        <PrimaryLink href="/products">Back to products</PrimaryLink>
      </Container>
    )
  }

  const p = project as any
  const screenshot = imageOf(p)
  const demoHost = hostOf(p.demo_url)
  const contributors = (p.contributors || [])
    .map((c: any) => ({ ...c, profile: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles || c.profile }))
    .filter((c: any) => c.profile)
  const more = (all || []).filter((x: any) => x.id !== p.id).slice(0, 3)
  const details = p.details ? cleanDetails(p.details) : ''

  return (
    <div>
      {/* Navy intro: the pitch on the left, the product itself on the right */}
      <section className="bg-navy text-white">
        <Container className="pt-11 pb-16">
          <Breadcrumb items={[{ label: 'Products', href: '/products' }, { label: p.title }]} />
          <div className="flex flex-wrap items-center gap-x-16 gap-y-12">
            <div className="min-w-0 flex-[1_1_420px]">
              <p className="mb-3.5 text-[15px] text-on-navy">
                {p.status === 'active' ? 'Live' : p.status === 'archived' ? 'Archived' : 'Completed'} · since {monthYear(p.created_at)}
              </p>
              <h1 className="mb-[18px] text-[36px] sm:text-[46px] lg:text-[58px] font-bold leading-[1.02] tracking-[-0.035em]">{p.title}</h1>
              {p.description && <p className="mb-[30px] max-w-[480px] text-[19px] leading-relaxed text-on-navy">{p.description}</p>}
              <div className="mb-[18px] flex flex-wrap gap-3">
                {p.demo_url && <NavyPrimaryLink href={p.demo_url} external>Try it{demoHost ? ` at ${demoHost}` : ''} ↗</NavyPrimaryLink>}
                {p.repo_url && <NavySecondaryLink href={p.repo_url} external>Source on GitHub ↗</NavySecondaryLink>}
              </div>
              {p.tech_stack?.length > 0 && <p className="text-sm text-on-navy">Built with {p.tech_stack.join(' · ')}</p>}
            </div>

            {screenshot && (
              <figure className="m-0 min-w-0 flex-[1_1_560px]">
                <div className="overflow-hidden rounded-xl bg-ink ring-1 ring-white/[0.18]">
                  <div className="flex items-center gap-3 bg-paper px-3.5 py-2.5">
                    <span aria-hidden="true" className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-control" />
                      <span className="h-2.5 w-2.5 rounded-full bg-control" />
                      <span className="h-2.5 w-2.5 rounded-full bg-control" />
                    </span>
                    <span className="flex-1 truncate text-center font-mono text-xs text-text-tertiary">{demoHost ?? p.title}</span>
                  </div>
                  <div className="relative aspect-video">
                    <Image src={screenshot} alt={`${p.title} screenshot`} fill priority sizes="(max-width: 1024px) 100vw, 640px" className="object-cover" />
                  </div>
                </div>
              </figure>
            )}
          </div>
        </Container>
      </section>

      {/* Story + side facts */}
      <section className="pt-20">
        <Container className="flex flex-wrap items-start gap-x-16 gap-y-12">
          <article className="min-w-0 flex-[1_1_600px]">
            <h2 className="mb-6 text-[28px] sm:text-[34px] font-bold tracking-[-0.025em] text-text-primary">About {p.title}</h2>
            {details ? (
              <div
                className="max-w-[720px] text-[17px] leading-[1.75] text-[#C9CED8] break-words
                  [&_h1]:hidden
                  [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-[22px] [&_h2]:font-bold [&_h2]:leading-snug [&_h2]:text-text-primary
                  [&_h3]:mb-2 [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-text-primary
                  [&_p]:mb-4 [&_div]:mb-3
                  [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1.5
                  [&_strong]:font-semibold [&_strong]:text-text-primary
                  [&_a]:text-link [&_a]:underline [&_a]:underline-offset-[3px]
                  [&_blockquote]:my-6 [&_blockquote]:border-l-[3px] [&_blockquote]:border-link [&_blockquote]:pl-5 [&_blockquote]:text-text-primary"
                dangerouslySetInnerHTML={{ __html: details }}
              />
            ) : (
              <p className="text-text-secondary">The team hasn&apos;t written up this product yet.</p>
            )}
          </article>

          <aside className="flex min-w-0 flex-[0_1_380px] flex-col gap-6 lg:sticky lg:top-[100px]">
            {p.video_url && (
              <div>
                <VideoPlayer url={p.video_url} title={`${p.title} walkthrough`} />
                <p className="mt-2.5 text-sm text-text-tertiary">Walkthrough video</p>
              </div>
            )}

            {contributors.length > 0 && (
              <div className="rounded-xl bg-paper p-6">
                <h2 className="mb-4 text-[15px] font-semibold text-text-primary">Built by</h2>
                <ul className="flex flex-col gap-4">
                  {contributors.map((c: any) => (
                    <li key={c.id}>
                      <Link href={`/members/${c.profile.id}`} className="group flex items-center gap-3.5">
                        <Avatar src={c.profile.avatar_url} name={c.profile.full_name} size="md" className="h-11 w-11" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-text-primary group-hover:text-link transition-colors">{c.profile.full_name}</span>
                          <span className="block text-sm text-text-tertiary">{c.role_in_project || 'Contributor'}</span>
                        </span>
                        {c.contribution_percentage != null && (
                          <span className="font-mono text-[13px] text-link">{c.contribution_percentage}%</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 rounded-xl bg-paper p-6 text-[15px]">
              <dt className="text-text-tertiary">Launched</dt>
              <dd className="text-right text-text-primary">{monthYear(p.created_at)}</dd>
              <dt className="text-text-tertiary">Status</dt>
              <dd className="text-right capitalize text-text-primary">{p.status}</dd>
              {p.demo_url && (
                <>
                  <dt className="text-text-tertiary">Website</dt>
                  <dd className="truncate text-right"><a href={p.demo_url} target="_blank" rel="noopener noreferrer" className="text-link hover:text-text-primary">{demoHost} ↗</a></dd>
                </>
              )}
              {p.repo_url && (
                <>
                  <dt className="text-text-tertiary">Code</dt>
                  <dd className="text-right"><a href={p.repo_url} target="_blank" rel="noopener noreferrer" className="text-link hover:text-text-primary">GitHub ↗</a></dd>
                </>
              )}
            </dl>
          </aside>
        </Container>
      </section>

      {more.length > 0 && (
        <section className="pt-[104px] pb-20 sm:pb-28">
          <Container>
            <SectionHeader title="More from the community" href="/products" linkLabel="All products" />
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((m: any) => (
                <Link key={m.id} href={`/products/${m.id}`} className="group flex flex-col gap-2.5">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[10px] bg-paper">
                    {imageOf(m) && <Image src={imageOf(m)} alt="" fill sizes="(max-width: 640px) 100vw, 400px" className="object-cover" />}
                  </div>
                  <h3 className="mt-1.5 text-[19px] font-bold text-text-primary group-hover:text-link transition-colors">{m.title}</h3>
                  <p className="line-clamp-2 text-[15px] text-text-secondary">{m.description}</p>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}
    </div>
  )
}
