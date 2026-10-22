import ProjectsClient, { type ProductListItem } from '@/components/ProjectsClient'
import { createClient } from '@/lib/supabase'

async function getInitialProjects(): Promise<ProductListItem[]> {
  try {
    const supabase = createClient()
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        created_by_profile:profiles(
          username,
          full_name,
          avatar_url
        ),
        project_contributors(
          contribution_percentage,
          role_in_project,
          profiles(username, full_name, avatar_url)
        ),
        thumbnail_image:images(
          id,
          filename,
          public_url,
          width,
          height,
          alt_text
        )
      `)
      .order('created_at', { ascending: false })

    if (error) return []
    return projects?.map(p => ({ ...p, contributors: p.project_contributors || [] })) || []
  } catch {
    return []
  }
}

export const revalidate = 60

export default async function ProjectsPage() {
  const initialProjects = await getInitialProjects()

  return <ProjectsClient initialProjects={initialProjects} />
}
