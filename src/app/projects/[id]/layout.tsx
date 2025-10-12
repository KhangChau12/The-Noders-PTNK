import { Metadata } from 'next'
import { createClient } from '@/lib/supabase'
import { generateMetadata as generateSEOMetadata, generateProjectSchema, generateBreadcrumbSchema } from '@/lib/seo'

interface Props {
  params: { id: string }
  children: React.ReactNode
}

// Generate dynamic metadata for each project
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()

  // Fetch project by ID
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      thumbnail_image:images!projects_thumbnail_image_id_fkey(
        public_url,
        alt_text
      )
    `)
    .eq('id', params.id)
    .single()

  if (!project) {
    return generateSEOMetadata({
      title: 'Project Not Found',
      noIndex: true,
    })
  }

  return generateSEOMetadata({
    title: project.title,
    description: project.description || `Check out ${project.title} - A project by The Noders PTNK`,
    keywords: [...(project.tech_stack || []), 'student project', 'tech project'],
    image: project.thumbnail_image?.public_url || project.thumbnail_url,
    url: `/projects/${project.id}`,
  })
}

export default function ProjectLayout({ params, children }: Props) {
  return (
    <>
      {/* Add JSON-LD structured data */}
      <ProjectStructuredData id={params.id} />
      {children}
    </>
  )
}

// Server component to add structured data
async function ProjectStructuredData({ id }: { id: string }) {
  const supabase = createClient()

  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      thumbnail_image:images!projects_thumbnail_image_id_fkey(
        public_url
      )
    `)
    .eq('id', id)
    .single()

  if (!project) return null

  const projectSchema = generateProjectSchema({
    name: project.title,
    description: project.description || '',
    url: `/projects/${project.id}`,
    image: project.thumbnail_image?.public_url || project.thumbnail_url,
    dateCreated: project.created_at,
    techStack: project.tech_stack || [],
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Projects', url: '/projects' },
    { name: project.title, url: `/projects/${project.id}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(projectSchema)
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
