import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase'
import { SITE_CONFIG } from '@/lib/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()

  // Static pages
  const staticPages = [
    {
      url: SITE_CONFIG.url,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${SITE_CONFIG.url}/projects`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_CONFIG.url}/posts`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_CONFIG.url}/members`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_CONFIG.url}/contest`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${SITE_CONFIG.url}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // Fetch all published posts
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const postPages = (posts || []).map((post) => ({
    url: `${SITE_CONFIG.url}/posts/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Fetch all projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, updated_at')
    .order('created_at', { ascending: false })

  const projectPages = (projects || []).map((project) => ({
    url: `${SITE_CONFIG.url}/projects/${project.id}`,
    lastModified: new Date(project.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Fetch all members
  const { data: members } = await supabase
    .from('profiles')
    .select('username, updated_at')
    .order('created_at', { ascending: false })

  const memberPages = (members || []).map((member) => ({
    url: `${SITE_CONFIG.url}/members/${member.username}`,
    lastModified: new Date(member.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...postPages, ...projectPages, ...memberPages]
}
