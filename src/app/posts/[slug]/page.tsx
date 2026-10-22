'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Loading } from '@/components/Loading'
import { Avatar } from '@/components/Avatar'
import { useAuth } from '@/components/AuthProvider'
import { useLanguage } from '@/components/LanguageProvider'
import { useToast } from '@/components/Toast'
import { Container, PrimaryLink, VideoPlayer } from '@/components/editorial'
import { Post, PostBlock } from '@/types/database'
import { postQueries } from '@/lib/queries'
import { SITE_CONFIG } from '@/lib/constants'
import { CONTESTS, COURSES } from '@/lib/programs'
import { cn } from '@/lib/utils'

interface PostWithDetails extends Post {
  author?: {
    id: string
    username: string
    full_name: string
    avatar_url: string | null
  }
  thumbnail_image?: {
    public_url: string
    alt_text?: string | null
    width?: number
    height?: number
  }
  thumbnail_url?: string | null
}

const CATEGORY_LABEL: Record<string, string> = {
  'Community Activities': 'Community',
  News: 'News',
  'You may want to know': 'Do you know?',
  'Tech Sharing': 'Tech sharing',
  'Member Spotlight': 'Member spotlight',
}

function formatDate(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Emoji in titles read as noise next to the editorial type. */
function cleanTitle(title?: string | null) {
  return (title || '').replace(/(?:[\u2600-\u27BF]|[\uD83C-\uDBFF][\uDC00-\uDFFF])\uFE0F?\s*/g, '').trim()
}

// Helper to add target="_blank" to all links in HTML
function processLinksInHTML(html: string): string {
  return html.replace(/<a\s+([^>]*href=["'][^"']*["'][^>]*)>/gi, (match, attributes) => {
    if (/target=/i.test(attributes)) return match
    return `<a ${attributes} target="_blank" rel="noopener noreferrer">`
  })
}

type Heading = { id: string; text: string }

/** Give every <h2> in the post an id so the "On this page" list can link to it. */
function withHeadingIds(html: string, blockIndex: number, out: Heading[]) {
  let n = 0
  return html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (_m, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, '').trim()
    const id = `s-${blockIndex}-${n++}`
    if (text) out.push({ id, text })
    return `<h2${attrs} id="${id}">${inner}</h2>`
  })
}

const PROSE =
  'mb-7 break-words text-[18px] leading-[1.8] text-[#C9CED8] ' +
  '[&_p]:mb-6 [&_h2]:mb-[18px] [&_h2]:mt-12 [&_h2]:scroll-mt-28 [&_h2]:text-[27px] [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:tracking-[-0.02em] [&_h2]:text-text-primary ' +
  '[&_h3]:mb-3 [&_h3]:mt-9 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-text-primary ' +
  '[&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 ' +
  '[&_strong]:font-semibold [&_strong]:text-text-primary [&_a]:text-link [&_a]:underline [&_a]:underline-offset-[3px] ' +
  '[&_blockquote]:my-8 [&_blockquote]:border-l-[3px] [&_blockquote]:border-link [&_blockquote]:pl-[22px] [&_blockquote]:text-[21px] [&_blockquote]:leading-relaxed [&_blockquote]:text-text-primary ' +
  '[&_code]:rounded [&_code]:bg-paper [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[15px]'

function RenderBlock({ block, lang, html }: { block: PostBlock; lang: 'en' | 'vi'; html?: string }) {
  switch (block.type) {
    case 'text':
      return <div className={PROSE} dangerouslySetInnerHTML={{ __html: html || '' }} />

    case 'quote': {
      const c = block.content as any
      const text = lang === 'vi' ? c.quote_vi || c.quote : c.quote_en || c.quote
      return (
        <figure className="my-10">
          <blockquote className="border-l-[3px] border-link pl-[22px] text-[21px] leading-relaxed text-text-primary">{text}</blockquote>
          {(c.author || c.source) && (
            <figcaption className="mt-3 pl-[25px] text-sm text-text-tertiary">
              — {c.author}
              {c.source && <span>, {c.source}</span>}
            </figcaption>
          )}
        </figure>
      )
    }

    case 'image': {
      const c = block.content as { caption?: string; alt_text?: string }
      const img = (block as any).image as { public_url?: string; alt_text?: string; width?: number; height?: number } | undefined
      if (!img?.public_url) return null
      return (
        <figure className="my-10">
          {img.width && img.height ? (
            <Image
              src={img.public_url}
              alt={c.alt_text || img.alt_text || c.caption || 'Post image'}
              width={img.width}
              height={img.height}
              className="h-auto w-full rounded-[10px]"
              sizes="(max-width: 768px) 100vw, 680px"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img.public_url} alt={c.alt_text || img.alt_text || c.caption || 'Post image'} className="h-auto w-full rounded-[10px]" loading="lazy" />
          )}
          {c.caption && <figcaption className="mt-2.5 text-sm text-text-tertiary">{c.caption}</figcaption>}
        </figure>
      )
    }

    case 'youtube': {
      const c = block.content as { youtube_url: string; video_id: string; title?: string }
      return (
        <figure className="my-10">
          <VideoPlayer url={c.youtube_url || `https://www.youtube.com/watch?v=${c.video_id}`} title={c.title || 'Video'} />
          {c.title && <figcaption className="mt-2.5 text-sm text-text-tertiary">{c.title}</figcaption>}
        </figure>
      )
    }

    default:
      return null
  }
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { session } = useAuth()
  const { lang, setLang, localize } = useLanguage()
  const slug = params.slug as string

  const [post, setPost] = useState<PostWithDetails | null>(null)
  const [blocks, setBlocks] = useState<PostBlock[]>([])
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([])
  const [userHasUpvoted, setUserHasUpvoted] = useState(false)
  const [upvoteCount, setUpvoteCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [upvoting, setUpvoting] = useState(false)
  const [showAuthMessage, setShowAuthMessage] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const viewCountIncrementedRef = useRef<string | null>(null)
  const shareRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchPost()
  }, [slug])

  // Separate effect to increment view count only once per post
  useEffect(() => {
    const incrementViewCount = async () => {
      if (post && post.status === 'published' && viewCountIncrementedRef.current !== post.id) {
        viewCountIncrementedRef.current = post.id
        try {
          await fetch(`/api/posts/${post.id}/view`, { method: 'POST' })
        } catch (err) {
          console.error('Failed to increment view count:', err)
        }
      }
    }

    incrementViewCount()
  }, [post?.id, post?.status])

  // Close share dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShareOpen(false)
      }
    }

    if (shareOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [shareOpen])

  const fetchPost = async () => {
    try {
      setLoading(true)
      setError(null)

      // Single optimized API call - get post by slug with all details
      const response = await postQueries.getPostBySlug(slug, session)

      if (response.error) {
        setError(response.error.message)
        return
      }

      if (!response.post) {
        setError('Post not found')
        return
      }

      setPost(response.post)
      setBlocks(response.blocks || [])
      setUserHasUpvoted(response.userHasUpvoted || false)
      setUpvoteCount(response.post?.upvote_count || 0)

      // Lazy load related posts after main content
      if (response.post?.id) {
        postQueries.getRelatedPosts(response.post.id, response.post.category, session)
          .then(related => {
            setRelatedPosts(related || [])
          })
          .catch(err => console.error('Failed to load related posts:', err))
      }

    } catch (err) {
      setError('Failed to load post')
      console.error('Error fetching post:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpvote = async () => {
    if (!session) {
      setShowAuthMessage(true)
      setTimeout(() => setShowAuthMessage(false), 5000)
      return
    }

    if (!post) return

    try {
      setUpvoting(true)
      const { upvoted, upvoteCount: newCount, error } = await postQueries.toggleUpvote(post.id, session)

      if (error) {
        setError('Failed to upvote: ' + error.message)
      } else {
        setUserHasUpvoted(upvoted || false)
        setUpvoteCount(newCount || 0)
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setUpvoting(false)
    }
  }

  const getPostUrl = () => `${SITE_CONFIG.url}/posts/${slug}`

  const handleShareFacebook = () => {
    const postUrl = encodeURIComponent(getPostUrl())
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${postUrl}`,
      '_blank',
      'noopener,noreferrer,width=600,height=400'
    )
    setShareOpen(false)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getPostUrl())
      setLinkCopied(true)
      showToast('success', localize('Link copied to clipboard!', 'Đã sao chép liên kết!'))
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      showToast('error', localize('Failed to copy link', 'Không thể sao chép liên kết'))
    }
    setShareOpen(false)
  }

  const handleShareClick = () => {
    // On mobile, use native share sheet for a richer experience
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: localize(post?.title, post?.title_vi),
        text: localize(post?.summary, post?.summary_vi),
        url: getPostUrl(),
      }).catch(() => {})
      return
    }
    // On desktop, toggle dropdown
    setShareOpen(prev => !prev)
  }

  // Reading progress for the thin bar under the header.
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      setProgress(h > 0 ? Math.min(1, window.scrollY / h) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Text blocks get heading ids; the collected headings feed "On this page".
  const { renderedHtml, headings } = useMemo(() => {
    const out: Heading[] = []
    const htmlByBlock: Record<string, string> = {}
    blocks.forEach((b, i) => {
      if (b.type !== 'text') return
      const c = b.content as any
      const raw = lang === 'vi' ? c.html_vi || c.html : c.html
      htmlByBlock[b.id] = withHeadingIds(processLinksInHTML(raw || ''), i, out)
    })
    return { renderedHtml: htmlByBlock, headings: out }
  }, [blocks, lang])

  if (loading) {
    return <Loading text="Loading post" />
  }

  if (error || !post) {
    return (
      <Container className="py-24">
        <h1 className="mb-3 text-3xl font-bold text-text-primary">{error || 'Post not found'}</h1>
        <p className="mb-6 text-text-secondary">The post you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <PrimaryLink href="/posts">Back to posts</PrimaryLink>
      </Container>
    )
  }

  const thumbnailSrc = post.thumbnail_image?.public_url || post.thumbnail_url
  const category = CATEGORY_LABEL[post.category] ?? post.category
  const title = cleanTitle(localize(post.title, post.title_vi))
  // Many summaries are just the opening paragraph; don't print the same text twice.
  const firstText = (() => {
    const b = blocks.find((x) => x.type === 'text')
    return b ? (renderedHtml[b.id] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase() : ''
  })()
  const summaryText = localize(post.summary, post.summary_vi) || ''
  const dek = summaryText && !firstText.startsWith(summaryText.trim().slice(0, 60).toLowerCase()) ? summaryText : ''
  const hasVi = !!(post.title_vi || post.summary_vi)
  // A post that is about one of our programs gets a context card beside it.
  const contest = CONTESTS.find((c) => c.postSlug === post.slug)
  const course = COURSES.find((c) => c.announcementSlug === post.slug)
  const [nextPost, ...morePosts] = relatedPosts

  return (
    <div>
      {/* Reading progress, pinned just under the sticky header */}
      <div aria-hidden="true" className="sticky top-[68px] z-30 h-0.5">
        <div className="h-0.5 bg-link transition-[width] duration-100" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* Compact navy intro at article width */}
      <section className="bg-navy text-white">
        <Container className={cn('pt-10', thumbnailSrc ? 'pb-[184px]' : 'pb-16')}>
          <div className="mx-auto max-w-[760px]">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm">
              <Link href={`/posts?category=${encodeURIComponent(post.category)}`} className="font-semibold text-white hover:text-on-navy">
                {category}
              </Link>
              {hasVi && (
                <span role="group" aria-label="Read in" className="inline-flex items-center gap-1 text-on-navy">
                  Read in
                  {(['en', 'vi'] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      aria-pressed={lang === l}
                      onClick={() => setLang(l)}
                      className={cn('ml-1 min-h-[32px] rounded-[5px] border border-white/35 px-2.5 text-[13px] font-semibold', lang === l ? 'bg-white text-navy-dark' : 'text-on-navy hover:text-white')}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </span>
              )}
            </div>
            <h1 className="mb-4 text-[32px] sm:text-[40px] lg:text-[50px] font-bold leading-[1.08] tracking-[-0.03em]">{title}</h1>
            {dek && <p className="mb-6 text-[19px] leading-relaxed text-on-navy">{dek}</p>}
            <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2.5 text-[15px] text-on-navy">
              {post.author && (
                <Link href={`/members/${post.author.id}`} className="inline-flex items-center gap-2.5 font-semibold text-white hover:text-on-navy">
                  <Avatar src={post.author.avatar_url} name={post.author.full_name} size="sm" className="h-8 w-8" />
                  {post.author.full_name}
                </Link>
              )}
              <span>{formatDate(post.published_at || post.created_at)}</span>
              {post.reading_time > 0 && <span>{post.reading_time} min read</span>}
              <span>{post.view_count} views</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Cover overlaps the navy field */}
      {thumbnailSrc && (
        <Container className="-mt-[152px]">
          <div className="relative mx-auto aspect-video max-w-[1000px] overflow-hidden rounded-xl bg-paper">
            <Image src={thumbnailSrc} alt={post.thumbnail_image?.alt_text || title} fill priority sizes="(max-width: 1024px) 100vw, 1000px" className="object-cover" />
          </div>
        </Container>
      )}

      {/* actions · article · context */}
      <Container className="grid grid-cols-1 items-start gap-x-12 pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,680px)_minmax(0,1fr)]">
        <aside aria-label="Post actions" className="order-2 mt-10 flex justify-center gap-2.5 lg:order-none lg:sticky lg:top-[110px] lg:mt-0 lg:flex-col lg:items-end">
          <button
            type="button"
            onClick={handleUpvote}
            disabled={upvoting}
            aria-pressed={userHasUpvoted}
            aria-label="Mark as helpful"
            className={cn(
              'flex w-14 flex-col items-center gap-0.5 rounded-[10px] border py-2.5 transition-colors',
              userHasUpvoted ? 'border-link bg-link/[0.12] text-text-primary' : 'border-control text-text-primary hover:border-text-tertiary'
            )}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current stroke-2"><path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="font-mono text-[13px]">{upvoteCount}</span>
          </button>
          <button type="button" onClick={handleCopyLink} aria-label="Copy link" className={cn('h-11 w-14 rounded-[10px] border border-control text-xs font-semibold transition-colors hover:border-text-tertiary', linkCopied ? 'text-link' : 'text-text-secondary')}>
            {linkCopied ? 'Copied' : 'Link'}
          </button>
          <button type="button" onClick={handleShareFacebook} aria-label="Share on Facebook" className="h-11 w-14 rounded-[10px] border border-control text-[13px] font-semibold text-text-secondary transition-colors hover:border-text-tertiary">
            fb ↗
          </button>
          {showAuthMessage && (
            <p role="status" className="max-w-[160px] text-right text-xs text-text-tertiary lg:mt-1">
              <Link href="/login" className="text-link">Sign in</Link> as a member to upvote.
            </p>
          )}
        </aside>

        <article className="order-1 min-w-0 lg:order-none">
          {blocks.map((block) => (
            <RenderBlock key={block.id} block={block} lang={lang} html={renderedHtml[block.id]} />
          ))}

          {post.author && (
            <Link href={`/members/${post.author.id}`} className="group mt-12 flex items-center gap-4 border-y border-rule py-[22px]">
              <Avatar src={post.author.avatar_url} name={post.author.full_name} size="lg" className="h-14 w-14" />
              <span className="flex-1">
                <span className="block text-[13px] text-text-tertiary">Written by</span>
                <span className="block text-[17px] font-bold text-text-primary group-hover:text-link transition-colors">{post.author.full_name}</span>
              </span>
              <span className="text-sm font-semibold text-link">Profile →</span>
            </Link>
          )}
        </article>

        <aside className="order-3 hidden flex-col gap-7 lg:sticky lg:top-[110px] lg:flex lg:max-w-[260px]">
          {headings.length > 1 && (
            <nav aria-label="On this page" className="text-sm">
              <h2 className="mb-2.5 text-[13px] font-semibold text-text-tertiary">On this page</h2>
              <ol className="flex flex-col gap-2 border-l border-[#2A2E37] pl-3">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="text-text-secondary transition-colors hover:text-white">{h.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          {contest && (
            <Link href={`/contest/${contest.slug}`} className="group block rounded-xl bg-paper p-[18px]">
              <span className="mb-1.5 block text-[13px] text-text-tertiary">This post is about</span>
              <span className="mb-3 block font-bold leading-snug text-text-primary group-hover:text-link transition-colors">{contest.title}</span>
              <span className="grid grid-cols-2 gap-2.5 text-[13px] text-text-secondary">
                {contest.facts.slice(0, 1).map((f) => (
                  <span key={f.label}><span className="block font-mono text-lg text-text-primary">{f.value}</span>{f.label}</span>
                ))}
                {contest.winners[0]?.score && (
                  <span><span className="block font-mono text-lg text-text-primary">{contest.winners[0].score}</span>winning MAE</span>
                )}
              </span>
              <span className="mt-3 block text-sm font-semibold text-link">Results &amp; problem →</span>
            </Link>
          )}
          {course && (
            <Link href={`/education/${course.slug}`} className="group block rounded-xl bg-paper p-[18px]">
              <span className="mb-1.5 block text-[13px] text-text-tertiary">This post is about</span>
              <span className="mb-2 block font-bold leading-snug text-text-primary group-hover:text-link transition-colors">{course.shortTitle}</span>
              <span className="block text-[13px] text-text-secondary">{course.sessions.length} sessions · all materials open</span>
              <span className="mt-3 block text-sm font-semibold text-link">Go to the course →</span>
            </Link>
          )}
        </aside>
      </Container>

      {/* Next read */}
      {nextPost && (
        <section className="pt-24 pb-20 sm:pb-28">
          <Container>
            <Link href={`/posts/${nextPost.slug}`} className="group mb-16 flex flex-wrap items-center gap-x-10 gap-y-6 rounded-xl bg-paper p-5 sm:p-8">
              {(nextPost as any).thumbnail_image?.public_url && (
                <div className="relative aspect-video min-w-0 flex-[0_1_360px] overflow-hidden rounded-lg">
                  <Image src={(nextPost as any).thumbnail_image.public_url} alt="" fill sizes="360px" className="object-cover" />
                </div>
              )}
              <span className="min-w-0 flex-[1_1_360px]">
                <span className="mb-1.5 block text-sm font-semibold text-link">Next in {category} →</span>
                <span className="mb-2 block text-[22px] sm:text-[30px] font-bold leading-tight tracking-[-0.02em] text-text-primary group-hover:text-link transition-colors">
                  {cleanTitle(localize(nextPost.title, nextPost.title_vi))}
                </span>
                <span className="line-clamp-2 block text-text-secondary">{localize(nextPost.summary, nextPost.summary_vi)}</span>
              </span>
            </Link>

            {morePosts.length > 0 && (
              <>
                <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="text-2xl font-bold tracking-[-0.02em] text-text-primary">More from {category}</h2>
                  <Link href="/posts" className="text-[15px] font-semibold text-link hover:text-text-primary">All posts →</Link>
                </div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {morePosts.slice(0, 3).map((r) => {
                    const src = (r as any).thumbnail_image?.public_url
                    return (
                      <Link key={r.id} href={`/posts/${r.slug}`} className="group flex flex-col gap-2.5">
                        <div className="relative aspect-video overflow-hidden rounded-[10px] bg-paper">
                          {src && <Image src={src} alt="" fill sizes="(max-width: 640px) 100vw, 400px" className="object-cover" />}
                        </div>
                        <span className="text-[13px] text-text-tertiary">{formatDate(r.published_at || r.created_at)}</span>
                        <h3 className="text-lg font-bold leading-snug text-text-primary group-hover:text-link transition-colors">
                          {cleanTitle(localize(r.title, r.title_vi))}
                        </h3>
                      </Link>
                    )
                  })}
                </div>
              </>
            )}
          </Container>
        </section>
      )}
      {!nextPost && <div className="pb-20 sm:pb-28" />}
    </div>
  )
}
