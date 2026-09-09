import { cache } from 'react'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase'
import { generateMetadata as generateSEOMetadata, generateArticleSchema, generateBreadcrumbSchema } from '@/lib/seo'

interface Props {
  params: { slug: string }
  children: React.ReactNode
}

// De-duplicated across generateMetadata + the structured-data component:
// React cache() collapses identical calls within a single request render.
const getPostForSlug = cache(async (slug: string) => {
  const supabase = createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(
        username,
        full_name
      ),
      thumbnail_image:images!posts_thumbnail_image_id_fkey(
        public_url,
        alt_text
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .limit(1)

  return posts?.[0] ?? null
})

// Generate dynamic metadata for each post
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostForSlug(params.slug)

  if (!post) {
    return generateSEOMetadata({
      title: 'Post Not Found',
      noIndex: true,
    })
  }

  return generateSEOMetadata({
    title: post.title,
    description: post.summary || `Read ${post.title} on The Noders Community blog`,
    keywords: [post.category, 'blog post', 'tech article'],
    image: post.thumbnail_image?.public_url,
    url: `/posts/${post.slug}`,
    type: 'article',
    publishedTime: post.published_at || post.created_at,
    modifiedTime: post.updated_at,
    author: post.author?.full_name || 'The Noders Community',
  })
}

export default function PostLayout({ params, children }: Props) {
  return (
    <>
      {/* Add JSON-LD structured data */}
      <PostStructuredData slug={params.slug} />
      {children}
    </>
  )
}

// Server component to add structured data
async function PostStructuredData({ slug }: { slug: string }) {
  const post = await getPostForSlug(slug)

  if (!post) return null

  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.summary || '',
    url: `/posts/${post.slug}`,
    image: post.thumbnail_image?.public_url,
    publishedTime: post.published_at || post.created_at,
    modifiedTime: post.updated_at,
    author: post.author?.full_name || 'The Noders Community',
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Posts', url: '/posts' },
    { name: post.title, url: `/posts/${post.slug}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
    </>
  )
}
